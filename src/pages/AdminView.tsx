import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

// Define the User type
interface User {
    id: number;
    username: string;
    user_type: string;
}

const AdminView = () => {
    const [users, setUsers] = useState<User[]>([]);
    
    useEffect(() => {
        // Fetch users from the database with credentials
        axios.get('http://localhost:8000/admin/user/get', {
            withCredentials: true
        })
            .then(response => {
                if (response.status !== 200) {
                    console.log(response);
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                setUsers(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the users!', error);
            });
    }, []);

    return (
        // Only render the component if the user is authenticated
        <Container maxWidth="md">
            <Typography variant="h2" component="h1" gutterBottom>
                ADMIN VIEW
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><b>ID</b></TableCell>
                            <TableCell><b>Username</b></TableCell>
                            <TableCell><b>Type</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user: User) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.id}</TableCell>
                                <TableCell>{user.username}</TableCell>
                                <TableCell>{user.user_type}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>);
};

export default AdminView;