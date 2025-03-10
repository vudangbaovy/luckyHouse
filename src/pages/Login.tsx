import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Typography, TextField, Button, Container, Snackbar, Alert, Grid2 } from '@mui/material';
import axios from 'axios';

interface LoginProps {
    isViewer: boolean;
}

interface LoginResponse {
    authenticated: boolean;
    user_type: string;
    message?: string;
    listing_url?: string;
}

const Login: React.FC<LoginProps> = ({ isViewer }) => {
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
            password: formData.get('password') as string,
            user_type: isViewer ? 'viewer' : 'admin'
        };

        console.log('Submitting login with data:', { 
            ...jsonData, 
            password: '[REDACTED]' 
        });

        try {
            const response = await axios.post<LoginResponse>('http://localhost:8000/auth/login', jsonData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Login response:', response.data);

            if (response.status === 200 && response.data.authenticated) {
                setSnackbarSeverity('success');
                setSnackbarMessage('Login successful');

                if (isViewer) {
                    if (response.data.listing_url) {
                        navigate(`/listing/${response.data.listing_url}`);
                    } else {
                        setSnackbarSeverity('error');
                        setSnackbarMessage('No listing URL available for this viewer');
                    }
                } else {
                    navigate('/');
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
                        {isViewer ? 'Listing Login' : 'User Login'}
                    </Typography>
                </Grid2>
                {isViewer && (
                    <Grid2>
                        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 2 }}>
                            Please use the link provided by the property manager to access your listing.
                        </Typography>
                    </Grid2>
                )}
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
                {!isViewer && (
                    <Grid2>
                        <Button
                            component={Link}
                            to="/viewer/login"
                            color="primary"
                            sx={{
                                color: 'grey',
                                textTransform: 'none',
                                mt: 2,
                                textDecoration: 'underline',
                                '&:hover': {
                                    backgroundColor: 'transparent',
                                },
                            }}
                        >
                            Looking to view a listing? Log in here.
                        </Button>
                    </Grid2>
                )}
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
}

export default Login;