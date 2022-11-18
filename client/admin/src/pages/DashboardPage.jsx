import React, { Fragment, useCallback, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Container, Menu, Dropdown, Icon } from 'semantic-ui-react';

import { useAuth } from '@amamentaufn/client-core';

// ------------------------------------------------------------------------------------------------------------
// DashboardPage Component
// ------------------------------------------------------------------------------------------------------------

export default function DashboardPage() {
  return (
    <div className='dashboard'>
      <Navbar />

      <Container style={{ marginTop: '30px' }}>
        <Outlet />
      </Container>
    </div>
  );
}

// ------------------------------------------------------------------------------------------------------------
// Navbar
// ------------------------------------------------------------------------------------------------------------

function Navbar() {
  const { user, hasPermission } = useAuth();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const gotoProfile = useCallback(() => {
    navigate(`/user/${user.id}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user && user.id, navigate]);

  const canManageUsers = hasPermission('CAN_MANAGE_USERS');

  return (
    <Fragment>
      <Menu fixed='top' inverted>
        <Container>
          <Link to='/'>
            <Menu.Item color='pink' active header>
              <b>PROJETO AMAMENTA</b>
            </Menu.Item>
          </Link>

          <Menu.Item as={Link} to='/posts'>
            Publicações
          </Menu.Item>

          <Menu.Item as={Link} to='/categories'>
            Categorias
          </Menu.Item>

          {canManageUsers ? (
            <Menu.Item as={Link} to='/users'>
              Usuários
            </Menu.Item>
          ) : null}

          {user ? (
            <Menu.Menu position='right'>
              <NavbarDropdown text={user.email}>
                <Dropdown.Item icon='setting' content='Minha Conta' onClick={gotoProfile} />
                <Dropdown.Item icon='sign-out' content='Sair' onClick={signOut} />
              </NavbarDropdown>
            </Menu.Menu>
          ) : null}
        </Container>
      </Menu>
    </Fragment>
  );
}

// ------------------------------------------------------------------------------------------------------------
// NavbarDropDown
// ------------------------------------------------------------------------------------------------------------

function NavbarDropdown({ children, ...props }) {
  const [isVisible, setVisiblity] = useState(false);

  const hide = useCallback(() => setVisiblity(false), []);
  const show = useCallback(() => setVisiblity(true), []);

  return (
    <Dropdown {...props} open={isVisible} onMouseOut={hide} onMouseOver={show} item>
      <Dropdown.Menu>{children}</Dropdown.Menu>
    </Dropdown>
  );
}
