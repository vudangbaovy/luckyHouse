import './App.css';
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { firebaseConfig } from './firebaseconfig';

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

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
          <Route path="*" element={<NoMatch />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </ThemeProvider>
    </div>
  );
};

export default App;

function NoMatch() {
  return (
    <div>
      <h2>Nothing to see here!</h2>
      <p>
        <Link to="/">Go to the home page</Link>
      </p>
    </div>
  );
}
