import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Button, Box } from '@mui/material';
import axios from 'axios';
import { Header } from '../components';
import Dashboard from './Dashboard.tsx';

const Home = () => {
    const [loginState, setLoginState] = useState<boolean>(false);

    const checkLogin = () => {
        axios.get('http://localhost:8000/auth/check', { withCredentials: true })
            .then((response) => {
            console.log('Logged in', response.data['logged_in']);
            setLoginState(response.data['logged_in']);
            })
            .catch((error) => {
            console.error('Not logged in', error);
            setLoginState(false);
            });
    };

    useEffect(() => {
        checkLogin();
    }, []);

    return (
        <div>
            <Header logged_in={loginState} />
            {!loginState && <Container maxWidth="sm">
                <Box sx={{ mt: 8, textAlign: 'center' }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Home
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        Welcome to Lucky House
                    </Typography>
                    <Button variant="contained" color="primary" component={Link} to="/login">
                        Login
                    </Button>
                </Box>
            </Container>}
            {loginState && <Dashboard />}
        </div>
    );
}

export default Home;