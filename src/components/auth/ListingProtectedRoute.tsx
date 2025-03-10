import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { CircularProgress, Box, Container, Typography, Paper, Button } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';

interface ListingProtectedRouteProps {
    children: React.ReactNode;
}

interface AuthCheckResponse {
    authenticated: boolean;
    user_type: string;
    listing_url?: string;
}

const ListingProtectedRoute: React.FC<ListingProtectedRouteProps> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const location = useLocation();
    const { url_token } = useParams<{ url_token: string }>();

    useEffect(() => {
        const checkListingAndAuth = async () => {
            try {
                // Check authentication first
                const authResponse = await axios.get<AuthCheckResponse>('http://localhost:8000/auth/', {
                    withCredentials: true
                });

                const isUserAdmin = authResponse.status === 200 && 
                    authResponse.data.authenticated && 
                    authResponse.data.user_type === 'admin';
                
                setIsAdmin(isUserAdmin);

                if (authResponse.status === 200 && authResponse.data.authenticated) {
                    // Admins can access any listing
                    if (isUserAdmin) {
                        setIsAuthenticated(true);
                    }
                    // For tenants, check if they have access to this specific listing
                    else if (authResponse.data.user_type === 'tenant') {
                        setIsAuthenticated(authResponse.data.listing_url === url_token);
                    }
                } else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                setIsAuthenticated(false);
                console.error('Auth check failed:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkListingAndAuth();
    }, [url_token]);

    if (isLoading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                <CircularProgress />
            </Box>
        );
    }

    // Handle authentication redirect
    if (!isAuthenticated) {
        localStorage.setItem('nextUrl', location.pathname);
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

export default ListingProtectedRoute; 