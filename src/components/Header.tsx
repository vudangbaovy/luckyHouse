import React, { useState, MouseEvent } from 'react';
import { AppBar, Box, Toolbar, Typography, IconButton, Menu, Container, MenuItem, Tooltip, Avatar } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import axios from 'axios';
import user_icon from '../assets/user_icon.png';

const settings = ['Profile', 'Logout'];

interface HeaderProps {
    logged_in: boolean;
}

const Header: React.FC<HeaderProps> = ({ logged_in }) => {
    const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

    const handleOpenNavMenu = (event: MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleLogout = (event: MouseEvent<HTMLElement>): void => {
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
                        <Tooltip title="Open settings">
                            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                <Avatar alt="Remy Sharp" src={user_icon} />
                            </IconButton>
                        </Tooltip>
                        <Menu
                            sx={{ mt: '45px' }}
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                        >
                            {settings.map((setting) => (
                                <MenuItem
                                    key={setting}
                                    onClick={setting === 'Logout' ? handleLogout : handleCloseUserMenu}
                                >
                                    <Typography sx={{ textAlign: 'center' }}>{setting}</Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>}
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Header;