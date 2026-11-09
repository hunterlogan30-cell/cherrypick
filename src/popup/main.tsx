import React from 'react';
import ReactDOM from 'react-dom/client';
import { PopupApp } from './PopupApp';
import { injectStylesInto } from '../styles/cherrypickStyles';
import { loadState, saveState } from '../services/storageService';

// Render the extension popup
injectStylesInto(document);
ReactDOM.createRoot(document.getElementById('popup-root')!).render(
  <React.StrictMode>
    <PopupApp isNativePopupWindow={true} />
  </React.StrictMode>
);

// When user opens the extension from the toolbar, make the floating card visible on the page
loadState().then((state) => {
  saveState({
    settings: {
      ...state.settings,
      overlayVisible: true,
    },
  });
});

