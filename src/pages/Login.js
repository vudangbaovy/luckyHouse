import React from 'react';
import { TextField, Button, Container, Typography, Box } from '@mui/material';

function Login() {
    const handleSubmit = (event) => {
        event.preventDefault();
        const form = event.target;
        const jsonData = {
            username: form.username.value,
            password: form.password.value
        };

        fetch('http://localhost:8000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonData),
        })
        .then(async (response) => {
            if (!response.ok) {
                console.log(response);
                throw new Error('Network response was not ok ' + response.statusText);
            }
            await response.json();
            window.location.href = '/admin';
        })
        .then((data) => {
            console.log(data);
        })
        .catch((error) => {
            console.error('There was a problem with the fetch operation:', error);
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