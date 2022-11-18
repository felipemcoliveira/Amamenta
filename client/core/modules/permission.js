import React, { useCallback, useContext, useEffect, useState } from 'react';
import { api } from './api';

// ------------------------------------------------------------------------------------------------------------
// PermissionsContent
// ------------------------------------------------------------------------------------------------------------

export const PermissionsContent = React.createContext({});

// ------------------------------------------------------------------------------------------------------------
// PermissionsContextProvider Component
// ------------------------------------------------------------------------------------------------------------

export function PermissionsContextProvider({ children }) {
  const [state, setState] = useState({
    isLoading: true,
    required: false,
    permissions: undefined,
    error: undefined,
    uauthorizred: false
  });

  const requirePermissions = useCallback(() => {
    if (state.required) {
      return;
    }
    setState(prev => ({ ...prev, isLoading: true, required: true }));
    const fetchPermissions = async () => {
      try {
        const { data } = await api.get('/permission');

        setState(prev => ({ ...prev, isLoading: false, permissions: data }));
      } catch (error) {
        if (error.isAxiosError && error.response.status === 401) {
          setState(prev => ({ ...prev, isLoading: false, unauthorized: true }));
          return;
        }

        setState(prev => ({ ...prev, isLoading: false, error }));
      }
    };
    fetchPermissions();
  }, [state.required]);

  return React.createElement(PermissionsContent.Provider, {
    value: {
      permissions: state.permissions,
      isLoading: state.isLoading,
      error: state.error,
      unauthorized: state.uauthorizred,
      requirePermissions
    },
    children
  });
}

// ------------------------------------------------------------------------------------------------------------
// usePermissions Hook
// ------------------------------------------------------------------------------------------------------------

export function usePermissions() {
  const { permissions, isLoading, error, unauthorized, requirePermissions } = useContext(PermissionsContent);
  useEffect(() => {
    requirePermissions();
  }, []);
  return [permissions, isLoading, error, !unauthorized];
}
