import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const rootElement = document.getElementById('root')

if (rootElement instanceof HTMLElement) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
      <App />
  )
} else {
  console.error('Unable to find root element with id "root"')
}
