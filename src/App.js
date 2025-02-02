import './App.css';
import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import TenantView from './pages/TenantView';
import AdminView from './pages/AdminView';
import ViewerView from './pages/ViewerView';
import Header from './components/Header';

function App() {
  return (
    <div>
      {/* Add header to the App component */}
      <Header />
      <BrowserRouter>
          <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/tenant" element={<TenantView />} />
              <Route path="/admin" element={<AdminView />} />
              <Route path="/viewer" element={<ViewerView />} />
          </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
