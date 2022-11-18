import { useCallback, useState, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Modal, Loader, Button, Table, Pagination, Popup, Label, Segment } from 'semantic-ui-react';
import { toast } from 'react-toastify';

import { api, useResource } from '@amamentaufn/client-core';

// ------------------------------------------------------------------------------------------------------------
// PostList Component
// ------------------------------------------------------------------------------------------------------------

export function PostList({ hideAuthor, itemsPerPage, filterCategory, filterAuthor, ...props }) {
  const [pageNum, setPageNum] = useState(0);
  const [page, isLoading, error] = useResource(
    {
      method: 'get',
      url: '/post',
      params: postParams(pageNum, itemsPerPage, filterAuthor, filterCategory)
    },
    [pageNum, filterAuthor, filterCategory, itemsPerPage]
  );

  const handlePageChange = useCallback((_, { activePage }) => {
    setPageNum(activePage - 1);
  }, []);

  if (isLoading) {
    return (
      <Segment attached='bottom'>
        <Loader active inline='centered' />
      </Segment>
    );
  }

  if (error) {
    return <Segment attached='bottom'>{error.renderErrorMessage()}</Segment>;
  }
  return (
    <Table size='small' compact {...props}>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>ID</Table.HeaderCell>
          <Table.HeaderCell>Título</Table.HeaderCell>
          {hideAuthor ? null : <Table.HeaderCell>Autor</Table.HeaderCell>}
          <Table.HeaderCell>Publicado em</Table.HeaderCell>
          <Table.HeaderCell>Categoria</Table.HeaderCell>
          <Table.HeaderCell></Table.HeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {page.posts.map((post, index) => {
          return <PostListItem key={index} post={post} hideAuthor={hideAuthor} />;
        })}

        {page.posts.length === 0 ? (
          <Table.Cell textAlign='center' colSpan='10'>
            Nenhuma publicação encontrada
          </Table.Cell>
        ) : null}
      </Table.Body>

      <Table.Footer>
        <Table.Row>
          <Table.HeaderCell colSpan='10' textAlign='center'>
            <Pagination
              lastItem={null}
              firstItem={null}
              activePage={pageNum + 1}
              totalPages={page.pageCount}
              onPageChange={handlePageChange}
            />
          </Table.HeaderCell>
        </Table.Row>
      </Table.Footer>
    </Table>
  );
}

// ------------------------------------------------------------------------------------------------------------
// PostListItem Component
// ------------------------------------------------------------------------------------------------------------

function PostListItem({ post, hideAuthor }) {
  const navigate = useNavigate();
  const [deleted, setDeleted] = useState(false);

  const handleEditClick = useCallback(() => {
    navigate(`/post/${post.id}`);
  }, [post.id, navigate]);

  const handleDelete = useCallback(() => {
    const del = async () => {
      try {
        await toast.promise(api.delete(`/post/${post.id}`), {
          pending: 'Deletando publicação...',
          success: 'Publicação deletada com sucesso.',
          error: {
            render({ data }) {
              return data.toString();
            }
          }
        });
        setDeleted(true);
      } catch (error) {}
    };
    del();
  }, [post.id]);

  if (deleted) {
    return null;
  }

  const { author, category } = post;
  const createdAt = new Date(post.createdAt);

  return (
    <Table.Row>
      <Table.Cell>{post.id}</Table.Cell>
      <Table.Cell>
        <Link to={`/post/${post.id}`}>{post.title}</Link>
      </Table.Cell>
      {hideAuthor ? null : (
        <Table.Cell>
          <Popup
            position='right center'
            wide='very'
            trigger={
              <Link to={`/user/${author.id}`}>
                <Label size='small' color='pink' basic>
                  {author.firstName}
                </Label>
              </Link>
            }
            inverted>
            <b>{`${author.firstName} ${author.lastName}`}:</b>
            <br />
            {author.email}
          </Popup>
        </Table.Cell>
      )}
      <Table.Cell>{createdAt.toLocaleString()}</Table.Cell>
      <Table.Cell>{category.name}</Table.Cell>
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

// ------------------------------------------------------------------------------------------------------------
// Helper Functions
// ------------------------------------------------------------------------------------------------------------

function postParams(page, itemsPerPage, filterAuthor, filterCategory) {
  const params = { page };
  if (itemsPerPage) {
    params.itemsPerPage = itemsPerPage;
  }

  if (filterCategory) {
    params.categoryId = filterCategory;
  }

  if (filterAuthor) {
    params.authorId = filterAuthor;
  }

  return params;
}
