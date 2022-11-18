import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './components/App';

// ------------------------------------------------------------------------------------------------------------
// Styles Importing
// ------------------------------------------------------------------------------------------------------------

import './styles/reset.scss';
import './styles/style.scss';
import 'froala-editor/css/froala_style.min.css';

// ------------------------------------------------------------------------------------------------------------
// Rendering
// ------------------------------------------------------------------------------------------------------------

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
