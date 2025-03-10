import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Typography, TextField, Button, Container, Snackbar, Alert, Grid2 } from '@mui/material';
import axios from 'axios';

interface LoginResponse {
    authenticated: boolean;
    user_type: string;
    message?: string;
    listing_url?: string;
}

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [openSnackBar, setOpenSnackbar] = useState(false);
    const [snackbarMsg, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'warning' | 'error'>('warning');

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        const jsonData = {
            username: formData.get('username') as string,
            password: formData.get('password') as string
        };

        try {
            const response = await axios.post<LoginResponse>('http://localhost:8000/auth/login', jsonData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200 && response.data.authenticated) {
                setSnackbarSeverity('success');
                setSnackbarMessage('Login successful');

                // Handle different user types
                if (response.data.user_type === 'tenant') {
                    if (response.data.listing_url) {
                        localStorage.removeItem('nextUrl'); // Clear any saved redirect
                        navigate(`/listing/${response.data.listing_url}`);
                    } else {
                        setSnackbarSeverity('error');
                        setSnackbarMessage('Tenant account has no assigned listing');
                    }
                } else if (response.data.user_type === 'admin') {
                    const nextUrl = localStorage.getItem('nextUrl');
                    localStorage.removeItem('nextUrl');
                    navigate(nextUrl || '/');
                }
            } else {
                setSnackbarSeverity('error');
                setSnackbarMessage(response.data.message || 'Login failed');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            setSnackbarSeverity('error');
            setSnackbarMessage(error.response?.data?.message || 'Login failed');
        }
    };

    useEffect(() => {
        if (snackbarMsg) {
            setOpenSnackbar(true);
        }
    }, [snackbarMsg]);

    return (
        <Container maxWidth="sm">
            <Grid2
                container
                direction="column"
                justifyContent="center"
                alignItems="center"
                spacing={2}
                sx={{ minHeight: '100vh' }}
            >
                <Grid2>
                    <Typography variant="h1" component="h1" gutterBottom>
                        User Login
                    </Typography>
                </Grid2>
                <Grid2>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Username"
                            name="username"
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            required
                            autoFocus
                        />
                        <TextField
                            label="Password"
                            name="password"
                            type="password"
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            required
                        />
                        <Button 
                            type="submit" 
                            variant="contained" 
                            color="primary" 
                            fullWidth
                            sx={{ mt: 2 }}
                        >
                            Log In
                        </Button>
                    </form>
                </Grid2>
            </Grid2>
            <Snackbar
                open={openSnackBar}
                autoHideDuration={6000}
                onClose={() => setOpenSnackbar(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={() => setOpenSnackbar(false)} 
                    severity={snackbarSeverity}
                >
                    {snackbarMsg}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default Login;