import { useCallback, useState } from 'react';
import { Navigate } from 'react-router-dom';

import { Button, Divider, Grid, Image, Segment, Message, Header } from 'semantic-ui-react';
import { Form } from 'formsy-semantic-ui-react';

import { useAuth } from '@amamentaufn/client-core';

// ------------------------------------------------------------------------------------------------------------
// Images
// ------------------------------------------------------------------------------------------------------------

import Logo from '../img/logo-projeto.svg';

// ------------------------------------------------------------------------------------------------------------
// LoginPage Component
// ------------------------------------------------------------------------------------------------------------

export default function LoginPage() {
  // this is only to avoid the form to display the error before user actually tried to login, this
  // happens because the useAuth tries to fecth authenticated user info to check if it's already logged in.
  const [tryCount, setTryCount] = useState(0);
  const { user, login, error, isAuthenticating } = useAuth();

  const handleLoginSubmit = useCallback(
    async ({ email, password }) => {
      try {
        setTryCount(prev => prev + 1);
        await login(email, password);
      } catch (error) {
        console.log(error);
      }
    },
    [login]
  );

  if (user) {
    return <Navigate to='/' />;
  }

  return (
    <Grid style={{ height: '100vh' }} textAlign='center' verticalAlign='middle'>
      <Grid.Column style={{ maxWidth: 390 }}>
        <Form error={error !== undefined && tryCount > 0} loading={isAuthenticating} onValidSubmit={handleLoginSubmit}>
          <Header attached='top' inverted>
            PAINEL DO ADMINSTRADOR
          </Header>
          <Segment attached='bottom'>
            <Image style={{ width: 200 }} src={Logo} centered />
            <Divider />
            <Message error>{error && error.toString()}</Message>
            <Form.Input name='email' validations='isEmail' icon='user' iconPosition='left' placeholder='Email' required fluid />
            <Form.Input
              name='password'
              type='password'
              validations='minLength:8'
              icon='lock'
              iconPosition='left'
              placeholder='Senha'
              required
              fluid
            />

            <Button color='pink' size='large' fluid>
              Acessar
            </Button>
          </Segment>
        </Form>
      </Grid.Column>
    </Grid>
  );
}
