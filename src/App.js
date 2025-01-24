import './App.css';
import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import UserView from './pages/TenantView';
import AdminView from './pages/AdminView';
import GuestView from './pages/CustomerView';

function App() {
  return (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/user" element={<UserView />} />
            <Route path="/admin" element={<AdminView />} />
            <Route path="/guest" element={<GuestView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
