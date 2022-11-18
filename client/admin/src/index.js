import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';

// ------------------------------------------------------------------------------------------------------------
// Modules
// ------------------------------------------------------------------------------------------------------------

import './module/api';

// ------------------------------------------------------------------------------------------------------------
// Styles Importing
// ------------------------------------------------------------------------------------------------------------

import 'semantic-ui-css/semantic.min.css';
import './styles/style.scss';

import 'froala-editor/css/froala_style.min.css';
import 'froala-editor/css/froala_editor.pkgd.min.css';
import 'froala-editor/css/plugins.pkgd.css';

// ------------------------------------------------------------------------------------------------------------
// Rendering
// ------------------------------------------------------------------------------------------------------------

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

root.render(<App />);
