import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './platform.css'; // استيراد التنسيقات التي نقلتها للتو

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);