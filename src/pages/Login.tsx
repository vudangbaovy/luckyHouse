import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, TextField, Button, Box, Container } from '@mui/material';
import axios from 'axios';

const Login: React.FC = () => {
    const navigate = useNavigate();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        const jsonData = {
            username: formData.get('username') as string,
            password: formData.get('password') as string
        };

        axios.post('http://localhost:8000/api/login', jsonData, { withCredentials: true })
            .then((response) => {
            if (response.status !== 200) {
                console.log(response);
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.data;
            })
            .then((data) => {
            console.log(data);
            if (data && data.user_type) {
                if (data.user_type === 'admin') {
                navigate('/admin');
                } else if (data.user_type === 'tenant') {
                navigate('/tenant');
                } else if (data.user_type === 'viewer') {
                navigate('/viewer');
                }
            } else {
                console.error('Invalid data:', data);
            }
            })
            .catch((error) => {
            console.error('There was a problem with the axios operation:', error);
            });
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Login
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Username"
                        name="username"
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        required
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
                    <Button type="submit" variant="contained" color="primary" fullWidth>
                        Log In
                    </Button>
                </form>
            </Box>
        </Container>
    );
}

export default Login;