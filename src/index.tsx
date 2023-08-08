import React from 'react';
import App from './App'
import './index.css'
import { createRoot } from 'react-dom/client';


const root = createRoot(document.getElementById('root') as HTMLDivElement);

root.render(
  <React.StrictMode>
      <App />
  </React.StrictMode>
);