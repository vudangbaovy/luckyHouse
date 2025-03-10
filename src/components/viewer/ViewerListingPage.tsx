import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Container,
    Typography,
    Box,
    Paper,
    Grid,
    CircularProgress,
    ImageList,
    ImageListItem,
    Button,
    Alert,
    Snackbar,
    Divider
} from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';

interface Listing {
    name: string;
    address: string;
    description: string;
    photos: string[];
}

const ViewerListingPage: React.FC = () => {
    const { url_token } = useParams<{ url_token: string }>();
    const navigate = useNavigate();
    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/listing/${url_token}/details`, {
                    withCredentials: true
                });
                setListing(response.data);
            } catch (error: any) {
                console.error('Error fetching listing:', error);
                if (error.response?.status === 401) {
                    navigate('/viewer/login');
                } else if (error.response?.status === 403) {
                    setError('You do not have permission to view this listing');
                } else {
                    setError(error.response?.data?.message || 'Error loading listing');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchListing();
    }, [url_token, navigate]);

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:8000/auth/logout', {}, {
                withCredentials: true
            });
            navigate('/viewer/login');
        } catch (error) {
            console.error('Error logging out:', error);
            setError('Error logging out');
        }
    };

    if (loading) {
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

    if (!listing) {
        return (
            <Container>
                <Alert severity="error" sx={{ mt: 4 }}>
                    {error || 'Listing not found'}
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header with Logout */}
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 4 
            }}>
                <Typography variant="h3" component="h1">
                    {listing.name}
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                >
                    Logout
                </Button>
            </Box>

            {/* Main Content */}
            <Grid container spacing={4}>
                {/* Photos Section */}
                <Grid item xs={12}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Typography variant="h5" gutterBottom>
                            Photos
                        </Typography>
                        <ImageList 
                            sx={{ 
                                height: 'auto',
                                gridAutoFlow: "column",
                                gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr)) !important",
                                gridAutoColumns: "minmax(300px, 1fr)"
                            }}
                            gap={16}
                        >
                            {listing.photos.map((photo, index) => (
                                <ImageListItem key={index}>
                                    <img
                                        src={photo}
                                        alt={`Listing photo ${index + 1}`}
                                        loading="lazy"
                                        style={{ 
                                            width: '100%', 
                                            height: 'auto',
                                            borderRadius: '4px'
                                        }}
                                    />
                                </ImageListItem>
                            ))}
                        </ImageList>
                    </Paper>
                </Grid>

                {/* Details Section */}
                <Grid item xs={12}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Typography variant="h5" gutterBottom>
                            Details
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    Address
                                </Typography>
                                <Typography paragraph>
                                    {listing.address}
                                </Typography>
                                <Divider sx={{ my: 2 }} />
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    Description
                                </Typography>
                                <Typography>
                                    {listing.description}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>

            {/* Error Snackbar */}
            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert 
                    onClose={() => setError(null)} 
                    severity="error"
                    sx={{ width: '100%' }}
                >
                    {error}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default ViewerListingPage; 