import { useCallback, useState, useRef, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Message, Loader, Button, Header, Segment, Table, Label } from 'semantic-ui-react';
import { Form } from 'formsy-semantic-ui-react';
import { generate as genertePassword } from '@wcj/generate-password';
import { toast } from 'react-toastify';

import { api, useResource, PASSWORD_REGEX, PERSON_NAME_REGEX } from '@amamentaufn/client-core';

// ------------------------------------------------------------------------------------------------------------
// UsersPage Component
// ------------------------------------------------------------------------------------------------------------

export default function UsersPage() {
  return (
    <Fragment>
      <CreateUser />
      <UserList />
    </Fragment>
  );
}

// ------------------------------------------------------------------------------------------------------------
// CreateUser Component
// ------------------------------------------------------------------------------------------------------------

function CreateUser() {
  const [isLoading, setIsLoading] = useState(false);
  const passwordFieldRef = useRef(null);
  const formRef = useRef(null);

  const handleCreateUser = useCallback(
    ({ firstName, lastName, email, password }) => {
      const handleCreateUserImpl = async () => {
        try {
          setIsLoading(true);

          await toast.promise(api.post('/user', { firstName, lastName, email, password }), {
            pending: 'Criando novo usuário.',
            success: 'Usuário criado com sucesso.',
            error: {
              render: function ({ data }) {
                return data.toString();
              }
            }
          });

          await navigator.clipboard.writeText(`email: ${email}, senha: ${password}`);
          toast.success('Senha e email copiados para o cliboard (Ctrl+C/Ctrl+V).');

          // clear form
          formRef.current && formRef.current.reset();
        } catch {}

        setIsLoading(false);
      };
      handleCreateUserImpl();
    },
    [formRef]
  );

  const handleClearForm = useCallback(
    evt => {
      evt.preventDefault();
      formRef.current && formRef.current.reset();
    },
    [formRef]
  );

  const handleGeneratePassword = useCallback(
    evt => {
      evt.preventDefault();
      if (passwordFieldRef.current) {
        const generatedPassword = genertePassword({ length: 15 });
        passwordFieldRef.current.props.setValue(generatedPassword);
      }
    },
    [passwordFieldRef]
  );

  const inputErrorLabel = <Label color='red' pointing prompt />;

  return (
    <Fragment>
      <Form loading={isLoading} ref={formRef} onValidSubmit={handleCreateUser}>
        <Header
          attached='top'
          content='Novo Usuário'
          icon='add user'
          subheader='Insira um novo usuário no sistema.'
          dividing
          inverted
        />

        <Segment attached>
          <Form.Group widths='equal'>
            {/* email address field */}
            <Form.Input
              name='email'
              label='Email'
              placeholder='Email'
              maxLength='255'
              errorLabel={inputErrorLabel}
              validations={{ isEmail: true }}
              validationErrors={{
                isDefaultRequiredValue: 'Campo obrigtório.',
                isEmail: 'Endereço de email inválido.'
              }}
              required
            />

            {/* password field */}
            <Form.Input
              action={{ icon: 'refresh', content: 'Gerar', onClick: handleGeneratePassword }}
              name='password'
              label='Senha'
              placeholder='Senha'
              innerRef={ref => (passwordFieldRef.current = ref)}
              autoComplete='off'
              maxLength='32'
              errorLabel={inputErrorLabel}
              validations={{ matchRegexp: PASSWORD_REGEX }}
              validationErrors={{
                isDefaultRequiredValue: 'Campo obrigtório.',
                matchRegexp:
                  'A senha deve ter de 8 a 32 caractérios e contar pelo menos ' +
                  'uma letrá maiúscula, outra minúscula, um número e um símbolo.'
              }}
              required
            />
          </Form.Group>

          <Form.Group widths='equal'>
            {/* first name field */}
            <Form.Input
              name='firstName'
              label='Nome'
              placeholder='Nome'
              maxLength='32'
              errorLabel={inputErrorLabel}
              validations={{ matchRegexp: PERSON_NAME_REGEX }}
              validationErrors={{
                isDefaultRequiredValue: 'Campo obrigtório.',
                matchRegexp: 'Utilize apenas caracteres permitidos.'
              }}
              required
            />

            {/* last name field */}
            <Form.Input
              name='lastName'
              label='Sobrenome'
              placeholder='Sobrenome'
              maxLength='32'
              errorLabel={inputErrorLabel}
              validations={{ matchRegexp: PERSON_NAME_REGEX }}
              validationErrors={{
                isDefaultRequiredValue: 'Campo obrigtório.',
                matchRegexp: 'Utilize apenas caracteres permitidos.'
              }}
              required
            />
          </Form.Group>
        </Segment>

        <Segment attached='bottom' textAlign='right' secondary>
          <Form.Button as={Button} icon='eraser' labelPosition='right' content='Limpar' onClick={handleClearForm} />
          <Form.Button as={Button} type='submit' icon='save' labelPosition='right' content='Cadastrar' positive />
        </Segment>
      </Form>
    </Fragment>
  );
}

// ------------------------------------------------------------------------------------------------------------
// UserList Component
// ------------------------------------------------------------------------------------------------------------

function UserList() {
  const [users, isLoading, error, { refresh }] = useResource({ method: 'get', url: '/user' });

  if (!users && isLoading) {
    return <Loader active inline='centered' />;
  }

  if (error) {
    return <Message header='Houve um erro.' content='Não foi possível carregar os usuários, tente novamente.' negative />;
  }
  return (
    <Fragment>
      <Header
        attached='top'
        content='Usuários'
        icon='users'
        subheader='Lista de usuários cadastrados no sistema.'
        dividing
        inverted
      />

      <Table size='small' attached='bottom' compact>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>ID</Table.HeaderCell>
            <Table.HeaderCell>Nome</Table.HeaderCell>
            <Table.HeaderCell>Sobrenome</Table.HeaderCell>
            <Table.HeaderCell>Email</Table.HeaderCell>
            <Table.HeaderCell></Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {users.map((user, index) => {
            return <UserRow key={index} user={user} />;
          })}
        </Table.Body>

        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan='5'>
              <Button
                loading={isLoading}
                onClick={refresh}
                floated='right'
                icon='refresh'
                labelPosition='right'
                content='Atualizar'
              />
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    </Fragment>
  );
}

// ------------------------------------------------------------------------------------------------------------
// UserRow Component
// ------------------------------------------------------------------------------------------------------------

function UserRow({ user: { id, firstName, lastName, email } }) {
  const navigate = useNavigate();
  const [deleted, setDeleted] = useState(false);

  const handleEditClick = useCallback(() => {
    navigate(`/user/${id}`);
  }, [id, navigate]);

  const handleDelete = useCallback(() => {
    const handleDeleteImpl = async () => {
      try {
        const deletePromise = api.delete(`/user/${id}`);
        toast.promise(deletePromise, {
          pending: 'Deletando usuário.',
          success: 'Usuário deletado com sucesso.',
          error: {
            render({ data }) {
              return data.toString();
            }
          }
        });
        await deletePromise;
        setDeleted(true);
      } catch (error) {}
    };
    handleDeleteImpl();
  }, [id]);

  if (deleted) {
    return null;
  }

  return (
    <Table.Row>
      <Table.Cell>{id}</Table.Cell>
      <Table.Cell>{firstName}</Table.Cell>
      <Table.Cell>{lastName}</Table.Cell>
      <Table.Cell>{email}</Table.Cell>
      <Table.Cell textAlign='right'>
        <Button size='tiny' onClick={handleEditClick} icon='edit' title='Editar' />

        <Modal
          trigger={<Button size='tiny' icon='trash' title='Deletar' negative />}
          header='Certeza que deseja deletar este usuário?'
          content='Caso este usuário seja deletado, todas suas publicações serão deletadas também.'
          actions={[
            {
              key: 'cancel',
              content: 'Cancelar',
              icon: 'cancel'
            },
            {
              key: 'done',
              content: 'Sim',
              negative: true,
              icon: 'trash',
              onClick: handleDelete
            }
          ]}
        />
      </Table.Cell>
    </Table.Row>
  );
}
