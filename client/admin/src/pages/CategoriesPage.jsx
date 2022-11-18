import { useCallback, useState, useRef, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form } from 'formsy-semantic-ui-react';
import { Modal, Message, Loader, Button, Header, Segment, Table, Label } from 'semantic-ui-react';
import { toast } from 'react-toastify';

import { api, useResource, useAuth } from '@amamentaufn/client-core';

// ------------------------------------------------------------------------------------------------------------
// CategoriesPage Component
// ------------------------------------------------------------------------------------------------------------

export default function CategoriesPage() {
  const { hasPermission } = useAuth();
  const canManageCategories = hasPermission('CAN_MANAGE_CATEGORIES');

  return (
    <Fragment>
      {canManageCategories ? <CreateCategory /> : null}
      <CategoriesList manageable={canManageCategories} />
    </Fragment>
  );
}

// ------------------------------------------------------------------------------------------------------------
// CreateCategory Component
// ------------------------------------------------------------------------------------------------------------

function CreateCategory() {
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef();

  const handleCreateUser = useCallback(
    ({ name, color }) => {
      const handleCreateUserImpl = async () => {
        try {
          setIsLoading(true);
          await toast.promise(api.post('/category', { name, color }), {
            pending: 'Criando nova categoria...',
            success: 'Categoria criada com sucesso.',
            error: {
              render: function ({ data }) {
                return data.toString();
              }
            }
          });

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

  const inputErrorLabel = <Label color='red' pointing prompt />;

  return (
    <Fragment>
      <Form loading={isLoading} ref={formRef} onValidSubmit={handleCreateUser}>
        <Header
          attached='top'
          content='Nova Categoria'
          icon='add'
          subheader='Insira uma nova categoria no sistema.'
          dividing
          inverted
        />
        <Segment attached clearing>
          <Form.Group widths='equal'>
            <Form.Input
              name='name'
              label='Nome'
              placeholder='Nome'
              maxLength='64'
              errorLabel={inputErrorLabel}
              validations={{ minLength: 3 }}
              validationErrors={{
                minLength: 'O nome da categoria deve ter pelo menos 3 caractérios'
              }}
              required
            />

            <Form.Input type='color' name='color' label='Cor' className='color-input' defaultValue='#e03997' />
          </Form.Group>
        </Segment>

        <Segment attached='bottom' textAlign='right'>
          <Form.Button as={Button} icon='eraser' labelPosition='right' content='Limpar' onClick={handleClearForm} />
          <Form.Button as={Button} type='submit' icon='save' labelPosition='right' content='Cadastrar' positive />
        </Segment>
      </Form>
    </Fragment>
  );
}

// ------------------------------------------------------------------------------------------------------------
// CategoriesList Component
// ------------------------------------------------------------------------------------------------------------

function CategoriesList({ manageable }) {
  const [categories, isLoading, error, { refresh }] = useResource({ method: 'get', url: '/category' });

  if (isLoading) {
    return <Loader active inline='centered' />;
  }

  if (error) {
    return <Message header='Houve um erro.' content='Não foi possível carregar as categorias, tente novamente.' negative />;
  }

  return (
    <Fragment>
      <Header attached='top' content='Categorias' icon='tag' subheader='Lista de categorias.' dividing inverted />

      <Table attached='bottom' size='small' compact>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Id</Table.HeaderCell>
            <Table.HeaderCell>Nome</Table.HeaderCell>
            <Table.HeaderCell></Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {categories.length === 0 ? (
            <Table.Row>
              <Table.Cell disabled colSpan='5' textAlign='center'>
                Nenhuma categoria foi criada ainda.
              </Table.Cell>
            </Table.Row>
          ) : null}

          {categories.map((categories, index) => {
            return <CategoryRow key={index} category={categories} manageable={manageable} />;
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
// CategoryRow Component
// ------------------------------------------------------------------------------------------------------------

function CategoryRow({ category, manageable }) {
  const [deleted, setDeleted] = useState(false);
  const navigate = useNavigate();

  const handleEdit = useCallback(() => {
    navigate(`/category/${category.id}`);
  }, [category.id]);

  const handleDelete = useCallback(() => {
    const handleDeleteImpl = async () => {
      try {
        await toast.promise(api.delete(`/category/${category.id}`), {
          pending: 'Deletando categoria.',
          success: 'Categoria deletada com sucesso.',
          error: {
            render({ data }) {
              return data.toString();
            }
          }
        });
        setDeleted(true);
      } catch (error) {}
    };
    handleDeleteImpl();
  }, [category.id]);

  if (deleted) {
    return null;
  }

  return (
    <Table.Row>
      <Table.Cell width={1}>{category.id}</Table.Cell>
      <Table.Cell>
        <span className='category-name' style={{ backgroundColor: category.color }}>
          {category.name}
        </span>
      </Table.Cell>
      <Table.Cell textAlign='right'>
        {manageable ? (
          <Fragment>
            <Button size='tiny' onClick={handleEdit} icon='edit' title='Editar' />
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
          </Fragment>
        ) : null}
      </Table.Cell>
    </Table.Row>
  );
}
