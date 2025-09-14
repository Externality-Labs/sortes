import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Website from './Website';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<Website />} />
        <Route path="home" element={<Website />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
