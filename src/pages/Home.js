import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Button, Box } from '@mui/material';

function Home() {
    return (
        <Container maxWidth="sm">
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
        </Container>
    );
}

export default Home;