import { useCallback, Fragment } from 'react';
import { useParams } from 'react-router-dom';

import { Loader, Header, Segment, Label, Icon } from 'semantic-ui-react';
import { Form } from 'formsy-semantic-ui-react';
import { toast } from 'react-toastify';

import { useAuth, api, useResource } from '@amamentaufn/client-core';

import { PostList } from '../components/PostList';

// ------------------------------------------------------------------------------------------------------------
// CategoryPage Component
// ------------------------------------------------------------------------------------------------------------

export default function CategoryPage() {
  const { id } = useParams();
  const [category, isLoading, error] = useResource({ method: 'get', url: `/category/${id}` });
  const { hasPermission } = useAuth();

  const handleSave = useCallback(
    ({ color, categoryName }) => {
      const handleSaveImpl = async () => {
        try {
          await toast.promise(api.patch(`/category/${id}`, { color, name: categoryName }), {
            pending: 'Atualizando...',
            success: 'Categoria atualizada com sucesso.',
            error: {
              render: function ({ data }) {
                return data.toString();
              }
            }
          });
        } catch (error) {}
      };
      handleSaveImpl();
    },
    [id]
  );

  if (isLoading) {
    return <Loader active inline='centered' />;
  } else if (error) {
    return error.renderErrorMessage();
  }

  const canManageCategories = hasPermission('CAN_MANAGE_CATEGORIES');
  const inputErrorLabel = <Label color='red' pointing prompt />;

  return (
    <Fragment>
      <Header attached='top' inverted>
        <Icon name='tag' />
        <Header.Content>
          {category.name}
          <Header.Subheader>{`ID: ${category.id}`}</Header.Subheader>
        </Header.Content>
      </Header>

      <Form disabled={!canManageCategories} onValidSubmit={handleSave}>
        <Segment attached>
          <Form.Group widths='equal'>
            <Form.Input
              name='categoryName'
              label='Nome'
              placeholder='Nome da categoria (Ex.: Enfermagem)'
              maxLength='32'
              defaultValue={category.name}
              errorLabel={inputErrorLabel}
              validations={{ minLength: 4 }}
              validationErrors={{
                isDefaultRequiredValue: 'Campo obrigtório.',
                minLength: 'Deve ter no minímo 4 caractérios.'
              }}
              required
            />

            <Form.Input type='color' name='color' label='Cor' className='color-input' defaultValue={category.color} />
          </Form.Group>
        </Segment>
        <Segment attached='bottom' textAlign='right' secondary>
          <Form.Button type='submit' icon='save' labelPosition='right' content='Salvar Alterações' positive />
        </Segment>
      </Form>

      <Header
        attached='top'
        content='Publicações'
        icon='list'
        subheader='Lista de publicações pertencentes a esta categoria.'
        dividing
        inverted
      />
      <PostList attached='bottom' itemsPerPage={10} filterCategory={category.id} />
    </Fragment>
  );
}
