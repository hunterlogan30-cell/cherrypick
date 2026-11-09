import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppRoot } from './AppRoot';
import { injectStylesInto } from './styles/cherrypickStyles';

injectStylesInto(document);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppRoot />
  </React.StrictMode>
);
