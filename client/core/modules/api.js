import axios from 'axios';
import { useEffect, useRef, useState, useCallback } from 'react';

// ------------------------------------------------------------------------------------------------------------
// API Axios Instance
// ------------------------------------------------------------------------------------------------------------

export const api = axios.create({
  baseURL: '/api',
  timeout: 2000,
  withCredentials: true,
  responseType: 'json'
});

api.interceptors.request.use(
  req => req,
  error => Promise.reject(new APIError(error))
);

api.interceptors.response.use(
  req => req,
  error => Promise.reject(new APIError(error))
);

// ------------------------------------------------------------------------------------------------------------
// APIErrorMessage Class
// ------------------------------------------------------------------------------------------------------------

export class APIError {
  constructor(error, message = undefined) {
    this.underlyingError = error;
    this.message = message || extractApiErrorMessage(error);

    if (error.isAxiosError && error.response) {
      this.status = error.status;
    }
  }

  toString() {
    if (this.message instanceof Array) {
      return this.message.join('\n');
    }

    return this.message;
  }
}

// ------------------------------------------------------------------------------------------------------------
// useResouce Hook
// ------------------------------------------------------------------------------------------------------------

export function useResource(requestOptions, deps = []) {
  const [state, setState] = useState({ isFetching: true });
  const currentRequestRef = useRef(null);

  const abortCurrentRequest = useCallback(ignorerError => {
    const currentRequest = currentRequestRef.current;
    if (currentRequest && currentRequest.isFetching) {
      currentRequest.ignorerError = ignorerError;
      currentRequest.abortController.abort();
    }
  }, []);

  const clear = useCallback(() => {
    abortCurrentRequest(true);
    setState({});
  }, []);

  const cancel = useCallback(() => {
    abortCurrentRequest(false);
  }, []);

  const update = useCallback(
    async updateOptions => {
      const { transformResource, transformError, ...options } = updateOptions || requestOptions;
      abortCurrentRequest(true);

      const currentRequest = {};
      currentRequest.isFetching = true;
      currentRequest.abortController = new AbortController();
      currentRequestRef.current = currentRequest;

      setState(prev => {
        if (prev.isFetching) {
          return prev;
        }
        return { isFetching: true };
      });

      try {
        const response = await api.request({ ...options, signal: currentRequest.abortController.signal });
        setState({ data: transformResource ? transformResource(response.data) : response.data });
      } catch (error) {
        if (currentRequest.ignorerError) {
          return;
        }
        setState({ error: transformError ? transformError(error) : error });
      } finally {
        currentRequest.isFetching = false;
      }
    },
    [...deps]
  );

  useEffect(() => {
    if (!requestOptions.lazy) {
      update(requestOptions);
    }
    return () => {
      abortCurrentRequest(false);
    };
  }, [...deps]);

  const refresh = useCallback(() => {
    update(requestOptions);
  }, [...deps]);

  return [
    state.data,
    state.isFetching,
    state.error,
    {
      clear,
      refresh,
      update,
      cancel
    }
  ];
}

// ------------------------------------------------------------------------------------------------------------
// API Error Localization
// ------------------------------------------------------------------------------------------------------------

const LOCALE_ERROR_MESSAGES = {
  'Forbidden': 'Permissão insuficiente.',
  'Unauthorized': 'Não autorizado.',
  'Internal Server Error': 'Houve um erro no servidor.',
  'Not Found': 'Não encontrado',
  'Forbidden': 'Sem permissão suficiente.'
};

// ------------------------------------------------------------------------------------------------------------
// Helper Functions
// ------------------------------------------------------------------------------------------------------------

function extractApiErrorMessage(error) {
  if (error.isAxiosError && 'response' in error) {
    const { data } = error.response;
    if ('message' in data) {
      return LOCALE_ERROR_MESSAGES[data.error] || data.message;
    }

    return LOCALE_ERROR_MESSAGES[data.error] || data.message;
  }
  return 'Houve um erro.';
}
