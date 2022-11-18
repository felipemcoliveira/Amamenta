import React, { useMemo, useRef, useCallback, useState, Fragment, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Header, Loader, Segment, Icon, Button, Label } from 'semantic-ui-react';
import { Form, Select } from 'formsy-semantic-ui-react';
import { toast } from 'react-toastify';

import { PostContentEditor } from '../components/PostContentEditor';

import { useResource, useAuth, deserializePostContent, updatePost } from '@amamentaufn/client-core';

// ------------------------------------------------------------------------------------------------------------
// PostPage Component
// ------------------------------------------------------------------------------------------------------------

export default function PostPage() {
  const { id } = useParams();
  const { user, hasPermission } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [post, isLoading, error, { update }] = useResource({ method: 'GET', url: `/post/${id}` }, [id]);
  const categoriesResource = useResource({ method: 'GET', url: '/category', lazy: true });
  const contentContainerRef = useRef();

  const categories = categoriesResource[0];
  const categoriesActions = categoriesResource[3];

  const categorySelectOptions = useMemo(() => {
    if (!categories) {
      return [];
    }

    return categories.map(category => {
      return {
        key: category.id,
        text: category.name,
        value: category.id
      };
    });
  }, [categories]);

  const toggleEditMode = useCallback(() => {
    categoriesActions.update();
    setEditMode(prev => !prev);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post, categoriesActions.update]);

  const handleSave = useCallback(
    ({ title, category }) => {
      const handleSaveImpl = async () => {
        await toast.promise(updatePost(post, title, editorContent, category), {
          pending: 'Publicando...',
          success: 'Publicado com sucesso.',
          error: {
            render({ data }) {
              return data.toString();
            }
          }
        });
        await update();
        setEditMode(false);
      };
      handleSaveImpl();
    },
    [post, editorContent]
  );

  const deserializedPostContent = useMemo(() => {
    return deserializePostContent(post);
  }, [post]);

  useEffect(() => {
    setEditorContent(deserializedPostContent);
  }, [deserializedPostContent]);

  if (isLoading) {
    return <Loader active inline='centered' />;
  } else if (error) {
    return error.renderErrorMessage();
  }

  const createdAt = new Date(post.createdAt);
  const authorFullName = `${post.author.firstName} ${post.author.lastName}`;
  const canManagePost = post.author.id === user?.id || hasPermission('CAN_MANAGE_ANY_POSTS');
  const inputErrorLabel = <Label color='red' pointing prompt />;

  return (
    <Form onValidSubmit={handleSave}>
      <Header attached='top' inverted>
        <Icon name='write square' />
        <Header.Content>
          {post.title}
          <Header.Subheader>
            <span>Publicado por </span>
            <Link style={{ color: '#fff' }} to={`/user/${post.author.id}`}>
              {authorFullName}
            </Link>
            <span> às {createdAt.toLocaleString()} em </span>
            <Link style={{ color: '#fff' }} to={`/category/${post.category.id}`}>
              {post.category.name}
            </Link>
          </Header.Subheader>
        </Header.Content>
      </Header>

      {editMode ? (
        <Fragment>
          <PostContentEditor
            content={editorContent}
            onContentChange={setEditorContent}
            previewContainerRef={contentContainerRef}
          />

          <Header icon='edit' content='Dados' attached inverted />
          <Segment attached clearing>
            <Form.Input
              name='title'
              label='Título'
              placeholder='Titulo'
              defaultValue={post.title}
              errorLabel={inputErrorLabel}
              maxLength='255'
              validations={{ minLength: 4 }}
              validationErrors={{
                isDefaultRequiredValue: 'Campo obrigtório.',
                minLength: 'Título muito curto.'
              }}
              required
            />

            <Form.Field
              name='category'
              control={Select}
              options={categorySelectOptions}
              defaultValue={post.category.id}
              label='Categoria'
              placeholder='Categoria'
              noResultsMessage='Nenhuma resultado encontrado.'
              search
              selection
              required
            />
          </Segment>
        </Fragment>
      ) : (
        <Segment attached>
          <div className='fr-view' dangerouslySetInnerHTML={{ __html: deserializedPostContent }} />
        </Segment>
      )}

      {canManagePost ? (
        <Segment attached='bottom' textAlign='right' secondary>
          {editMode ? (
            <Fragment>
              <Button type='button' icon='edit' labelPosition='left' content='Cancelar Edição' onClick={toggleEditMode} />
              <Form.Button as={Button} icon='save' labelPosition='left' content='Editar Publicação' positive />
            </Fragment>
          ) : (
            <Button type='button' icon='edit' labelPosition='left' content='Editar Publicação' onClick={toggleEditMode} />
          )}
        </Segment>
      ) : null}
    </Form>
  );
}
