import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, TextField, Button, Box, Container, Snackbar, Alert } from '@mui/material';
import axios from 'axios';
import { Warning } from '@mui/icons-material';

const Login = () => {
    const navigate = useNavigate();
    const [openSnackBar, setOpenSnackbar] = useState(false);
    const [snackbarMsg, setSnackbarMessage] = useState("");


    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        const jsonData = {
            username: formData.get('username') as string,
            password: formData.get('password') as string
        };

        axios.post('http://localhost:8000/auth/login', jsonData, { withCredentials: true })
            .then((response) => {
                if (response.status !== 200) {
                    console.log(response);
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.data;
            })
            .then((data) => {
                console.log(data);
                navigate('/');
            })
            .catch((error) => {
            console.error('There was a problem with the axios operation:', error);
            setSnackbarMessage(error.response.data['message']);
            });
    };
    
    useEffect(() => {
        if (snackbarMsg) {
          setOpenSnackbar(true);
        }
      }, [snackbarMsg]);

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
            <Snackbar
              open={openSnackBar}
              autoHideDuration={6000}
              onClose={() => setOpenSnackbar(false)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
              <Alert onClose={() => setOpenSnackbar(false)} severity={'warning'}>
                {snackbarMsg}
              </Alert>
            </Snackbar>
        </Container>
    );
}

export default Login;