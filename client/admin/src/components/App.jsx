import React, { Fragment, Suspense } from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import { Message } from 'semantic-ui-react';

import { AuthContextProvider, PermissionsContextProvider } from '@amamentaufn/client-core';

// ------------------------------------------------------------------------------------------------------------
// Toastify
// ------------------------------------------------------------------------------------------------------------

import { ToastContainer, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ------------------------------------------------------------------------------------------------------------
// Lazy Components
// ------------------------------------------------------------------------------------------------------------

const LoginPage = lazy(() => import('../pages/LoginPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const UsersPage = lazy(() => import('../pages/UsersPage'));
const UserPage = lazy(() => import('../pages/UserPage'));
const CategoriesPage = lazy(() => import('../pages/CategoriesPage'));
const CategoryPage = lazy(() => import('../pages/CategoryPage'));
const PostsPage = lazy(() => import('../pages/PostsPage'));
const PostPage = lazy(() => import('../pages/PostPage'));
const PublishPostPage = lazy(() => import('../pages/PublishPostPage'));

// ------------------------------------------------------------------------------------------------------------
// App
// ------------------------------------------------------------------------------------------------------------

export default function App() {
  return (
    <Fragment>
      <BrowserRouter basename='/admin'>
        <AuthContextProvider>
          <PermissionsContextProvider>
            <Routes>
              <Route exact path='login' element={<LoginPage />} />
              <Route path='*' element={<DashboardPage />}>
                <Route index element={<PostsPage />} />
                <Route path='users' element={<UsersPage />} />
                <Route path='user/:id' element={<UserPage />} />
                <Route path='categories' element={<CategoriesPage />} />
                <Route path='category/:id' element={<CategoryPage />} />
                <Route path='posts' element={<PostsPage />} />
                <Route path='post/publish' element={<PublishPostPage />} />
                <Route path='post/:id' element={<PostPage />} />
                <Route path='*' element={<PageNotFound />} />
              </Route>
            </Routes>

            <ToastContainer
              position='bottom-right'
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme='dark'
              transition={Zoom}
            />
          </PermissionsContextProvider>
        </AuthContextProvider>
      </BrowserRouter>
    </Fragment>
  );
}

// ------------------------------------------------------------------------------------------------------------
// PageNotFound Component
// ------------------------------------------------------------------------------------------------------------

function PageNotFound() {
  return <Message>Página não encontrada.</Message>;
}

// ------------------------------------------------------------------------------------------------------------
// Helper Functions
// ------------------------------------------------------------------------------------------------------------

function lazy(importComponentFn) {
  const Component = React.lazy(importComponentFn);
  return function () {
    return (
      <Suspense>
        <Component />
      </Suspense>
    );
  };
}
