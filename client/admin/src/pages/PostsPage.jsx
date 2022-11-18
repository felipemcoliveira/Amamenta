import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Button, Header, Segment } from 'semantic-ui-react';

import { PostList } from '../components/PostList';

// ------------------------------------------------------------------------------------------------------------
// PostsPage Component
// ------------------------------------------------------------------------------------------------------------

export default function PostsPage() {
  return (
    <Fragment>
      <Header attached='top' content='Ações' icon='play circle' dividing inverted />
      <Segment attached='bottom' secondary>
        <Button as={Link} to='/post/publish' color='pink' content='Nova Publicação' icon='add' labelPosition='left' />
      </Segment>

      <Header
        attached='top'
        content='Publicações'
        icon='list'
        subheader='Lista de todas as publicações do blog.'
        dividing
        inverted
      />

      <PostList attached='bottom' />
    </Fragment>
  );
}
