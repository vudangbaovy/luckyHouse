import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { CircularProgress, Box, Container, Typography, Paper, Button } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';

interface ViewerProtectedRouteProps {
    children: React.ReactNode;
}

interface AuthCheckResponse {
    authenticated: boolean;
    user_type: string;
    listing_url?: string;
}

const ViewerProtectedRoute: React.FC<ViewerProtectedRouteProps> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isListingOpen, setIsListingOpen] = useState<boolean | null>(null);
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

                // Check listing status
                const listingResponse = await axios.get(`http://localhost:8000/listing/${url_token}/check-status`);
                setIsListingOpen(listingResponse.data.open);

                if (authResponse.status === 200 && authResponse.data.authenticated) {
                    // Admins can access any listing regardless of status
                    if (isUserAdmin) {
                        setIsAuthenticated(true);
                    }
                    // For viewers, check both listing status and URL match
                    else if (authResponse.data.user_type === 'viewer') {
                        setIsAuthenticated(
                            listingResponse.data.open && 
                            authResponse.data.listing_url === url_token
                        );
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

    // Show "not available" message only for non-admin users
    if (!isAdmin && isListingOpen === false) {
        return (
            <Container maxWidth="sm" sx={{ py: 4 }}>
                <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Listing Not Available
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 4 }}>
                        This listing is not open for viewing at this time.
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<HomeIcon />}
                        onClick={() => window.location.href = '/'}
                    >
                        Go to Home
                    </Button>
                </Paper>
            </Container>
        );
    }

    // Handle authentication redirect
    if (!isAuthenticated) {
        localStorage.setItem('nextUrl', location.pathname);
        return <Navigate to="/viewer/login" replace />;
    }

    return <>{children}</>;
};

export default ViewerProtectedRoute; 