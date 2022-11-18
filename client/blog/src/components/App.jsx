import { Header } from './Header';
import React, { Suspense } from 'react';
import Footer from './Footer';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

// ------------------------------------------------------------------------------------------------------------
// Styles
// ------------------------------------------------------------------------------------------------------------

import './App.scss';

// ------------------------------------------------------------------------------------------------------------
// Lazy Component
// ------------------------------------------------------------------------------------------------------------

const HomePage = lazy(() => import('../pages/HomePage'));
const PostPage = lazy(() => import('../pages/PostPage'));

// ------------------------------------------------------------------------------------------------------------
// App Component
// ------------------------------------------------------------------------------------------------------------

export default function App() {
  return (
    <BrowserRouter>
      <div className='app'>
        <Header />

        <Routes>
          <Route index element={<HomePage />} />
          <Route path='publicacao/:id/*' element={<PostPage />} />
        </Routes>
      </div>

      <Footer />
    </BrowserRouter>
  );
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
