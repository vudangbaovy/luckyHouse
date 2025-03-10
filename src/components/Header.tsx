import React, { useState, MouseEvent } from 'react';
import { AppBar, Box, Toolbar, Typography, IconButton, Menu, Container, MenuItem, Tooltip, Avatar } from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';
import axios from 'axios';

const settings = ['Logout'];

interface HeaderProps {
    logged_in: Boolean;
}

const Header: React.FC<HeaderProps> = ({ logged_in }) => {
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

    const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleLogout = (): void => {
        axios.post('http://localhost:8000/auth/logout', {}, { withCredentials: true })
            .then((response) => {
                console.log('Logged out successfully');
                window.location.reload();
            })
            .catch((error) => {
                console.error('There was an error logging out!', error);
            });
    };

    return (
        <AppBar position="static">
            <Container>
                <Toolbar sx={{ justifyContent: 'space-between', backgroundColor: 'primary' }}>
                    <Typography
                        variant="h1"
                        noWrap
                        component="a"
                        href="/"
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        LUCKY HOUSE
                    </Typography>
                    <Typography
                        variant="h1"
                        noWrap
                        component="a"
                        href="/"
                        sx={{
                            mr: 2,
                            display: { xs: 'flex', md: 'none' },
                            flexGrow: 1,
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        LUCKY HOUSE
                    </Typography>
                    
                    {logged_in && <Box sx={{ flexGrow: 0 }}>
                        <Tooltip title="Logout">
                            <IconButton onClick={handleLogout} sx={{ p: 0 }}>
                                <LogoutIcon color='inherit' sx={{ color: 'white' }}/>
                            </IconButton>
                        </Tooltip>
                    </Box>}
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Header;