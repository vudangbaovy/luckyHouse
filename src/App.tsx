import './App.css';
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  Home,
  Login,
  TenantView,
  AdminView,
  ViewerView,
  Dashboard
} from './pages';
import { Header } from './components';

const App: React.FC = () => {
  return (
    <div>
      <Header />
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
    </div>
  );
}

export default App;
