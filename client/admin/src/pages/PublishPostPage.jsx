import { useCallback, useState, useRef, useMemo, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, Segment, Label } from 'semantic-ui-react';
import { Form, Select } from 'formsy-semantic-ui-react';
import { toast } from 'react-toastify';

import { useResource, createPost } from '@amamentaufn/client-core';
import { PostContentEditor } from '../components/PostContentEditor';

// ------------------------------------------------------------------------------------------------------------
// PublishPostPage Component
// ------------------------------------------------------------------------------------------------------------

export default function PublishPostPage() {
  const [categories, isCategoriesLoading] = useResource({ method: 'GET', url: '/category' });
  const [editorContent, setEditorContent] = useState('');
  const navigate = useNavigate();
  const previewContainerRef = useRef();

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

  const handlePublishClick = useCallback(
    ({ title, category }) => {
      const handlePublishClickImpl = async () => {
        const res = await toast.promise(createPost(title, editorContent, category), {
          pending: 'Publicando...',
          success: 'Publicado com sucesso.',
          error: {
            render({ data }) {
              return data.toString();
            }
          }
        });
        navigate('/post/' + res.data.id);
      };
      handlePublishClickImpl();
    },
    [navigate, editorContent]
  );

  const inputErrorLabel = <Label color='red' pointing prompt />;

  return (
    <Fragment>
      <Form loading={isCategoriesLoading} onValidSubmit={handlePublishClick}>
        <Header
          attached='top'
          content='Nova publicação'
          icon='write square'
          subheader='Escreva uma publicação para o blog.'
          dividing
          inverted
        />

        <Segment attached>
          <Form.Input
            name='title'
            label='Título'
            placeholder='Titulo'
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
            label='Categoria'
            placeholder='Categoria'
            noResultsMessage='Nenhuma resultado encontrado.'
            search
            selection
            required
          />
        </Segment>

        <PostContentEditor onContentChange={setEditorContent} previewContainerRef={previewContainerRef} />

        <Segment secondary attached='bottom' textAlign='right'>
          <Form.Button type='submit' icon='add' labelPosition='right' content='Publicar' positive />
        </Segment>
      </Form>

      <Header attached='top' content='Preview' icon='eye' dividing inverted />
      <Segment secondary attached='bottom'>
        <div className='fr-view' ref={previewContainerRef}></div>
      </Segment>
    </Fragment>
  );
}
