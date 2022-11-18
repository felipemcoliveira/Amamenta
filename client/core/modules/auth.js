import React, { Fragment, useCallback, useContext, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Dimmer, Loader } from 'semantic-ui-react';

import { api, useResource } from './api';

// ------------------------------------------------------------------------------------------------------------
// AuthContext
// ------------------------------------------------------------------------------------------------------------

export const AuthContext = React.createContext({});

// ------------------------------------------------------------------------------------------------------------
// AuthContextProvider Component
// ------------------------------------------------------------------------------------------------------------

export function AuthContextProvider({ children }) {
  const [user, isAuthenticating, error, { update, clear }] = useResource({ method: 'GET', url: '/auth' });
  const location = useLocation();
  const navigate = useNavigate();

  const login = useCallback(
    (email, password) => {
      if (user || isAuthenticating) {
        return;
      }

      update({
        method: 'POST',
        url: '/auth/login',
        data: { email, password },
        transformResource: data => data.user
      });
    },
    [user, isAuthenticating, update]
  );

  const hasPermission = useCallback(
    identifier => {
      if (!user) {
        return false;
      }
      if (Array.isArray(identifier)) {
        for (const i of identifier) {
          if (user.permissions.includes(i)) {
            return true;
          }
        }
        return false;
      }

      return user.permissions.includes(identifier);
    },
    [user]
  );

  const ctx = useMemo(() => {
    return { user, isAuthenticating, error, signOut: clear, hasPermission, login };
  }, [user, error, clear, isAuthenticating, hasPermission, login]);

  if (!isAuthenticating && !user && location.pathname !== '/login') {
    navigate('/login');
  }

  return React.createElement(AuthContext.Provider, { value: ctx, children: children });
}

// ------------------------------------------------------------------------------------------------------------
// useAuth Hook
// ------------------------------------------------------------------------------------------------------------

export function useAuth() {
  return useContext(AuthContext);
}
