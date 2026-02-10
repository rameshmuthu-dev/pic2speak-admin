// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify'; // User-friendly error/success popups
import 'react-toastify/dist/ReactToastify.css';
import './index.css'; // Consistent styling with user end
import App from './App.jsx';
import  store  from './redux/store.js'; // Ensure Redux store is set up for Admin

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <Router>
        <App />
      </Router>
      <ToastContainer
        position="top-right" // Admin notifications-ukku top-right nallaa irukkum
        autoClose={3000}
        theme="colored"
      />
    </Provider>
  </React.StrictMode>
);