import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import TeluguWordle from './TeluguWordle';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <TeluguWordle />
  </React.StrictMode>
);