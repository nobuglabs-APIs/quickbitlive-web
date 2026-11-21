// Ensure fetch property is writable on window and globalThis before polyfills or components execute
try {
  const root = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : self);
  if (root && root.fetch) {
    const origFetch = root.fetch.bind(root);
    const desc = Object.getOwnPropertyDescriptor(root, 'fetch');
    if (!desc || !desc.set) {
      let current = origFetch;
      try {
        Object.defineProperty(root, 'fetch', {
          get: () => current,
          set: (fn) => { current = fn; },
          configurable: true,
          enumerable: true,
        });
      } catch {
      }
    }
  }
} catch {
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
