import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Button, Grid2 } from '@mui/material';
import axios from 'axios';
import { Header } from '../components';
import Dashboard from './Dashboard.tsx';
import logo from '../assets/logo.jpeg';

const Home: React.FC = () => {
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

            {!loginState && (
                <Container maxWidth="sm">
                    <Grid2
                        container
                        direction="column"
                        justifyContent="center"
                        alignItems="center"
                        spacing={4}
                        sx={{ minHeight: '100vh' }}
                    >
                        <Grid2 container justifyContent="center">
                            <img src={logo} alt="Logo" style={{ width: '50%' }} />
                        </Grid2>
                        <Grid2>
                            <Typography variant="h3" gutterBottom>
                                Log in to view your dashboard
                            </Typography>
                        </Grid2>
                        <Grid2>
                            <Button variant="contained" color="primary" component={Link} to="/login">
                                Login
                            </Button>
                        </Grid2>
                    </Grid2>
                </Container>
            )}

            {loginState && <Dashboard />}
        </div>
    );
}

export default Home;