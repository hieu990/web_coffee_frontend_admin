import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import App from './App';
import './index.css';
import { API_BASE_URL } from './utils/api';

// Globally intercept axios requests to dynamically route localhost to production domain
axios.interceptors.request.use((config) => {
  if (config.url && config.url.startsWith('http://localhost/Web_coffee')) {
    config.url = config.url.replace('http://localhost/Web_coffee', API_BASE_URL);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
);
