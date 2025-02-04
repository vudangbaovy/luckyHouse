import './App.css';
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  Home,
  Login,
  TenantView,
  AdminView,
  ViewerView
} from './pages';
import { Header } from './components';

const App: React.FC = () => {
  return (
    <div>
      {/* Add header to the App component */}
      <Header />
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/tenant" element={<TenantView />} />
            <Route path="/admin" element={<AdminView />} />
            <Route path="/viewer" element={<ViewerView />} />
        </Routes>
    </div>
  );
}

export default App;
