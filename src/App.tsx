import './App.css';
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  Home,
  Login
} from './pages';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Container, Typography } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1f335c", // Customize primary color
    },
    secondary: {
      main: "#6c0e32", // Customize secondary color
    },
    background: {
      default: "#f5f5f5", // Background color
    },
  },
  typography: {
    fontFamily: "Arial, sans-serif",
    h1: {
      fontSize: "1.75rem",
      fontWeight: 1000,
    },
    h2: {
      fontSize: "1.5rem",
      fontWeight: 1000,
    },
    h3: {
      fontSize: "1.17rem",
      fontWeight: 500,
    },
    h4: {
      fontSize: "1rem",
      fontWeight: 500,
    },
    h5: {
      fontSize: "0.83rem",
      fontWeight: 500,
    },
  },
});

const App: React.FC = () => {
  return (
    <div>
      <ThemeProvider theme={theme}>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
        </Routes>
      </ThemeProvider>
    </div>
  );
}

export default App;
