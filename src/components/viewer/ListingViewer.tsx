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
    Snackbar
} from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';

interface Listing {
    id: string;
    name: string;
    address: string;
    description: string;
    photos: string[];
}

const ListingViewer: React.FC = () => {
    const { url_token } = useParams<{ url_token: string }>();
    const navigate = useNavigate();
    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/listing/${url_token}`, {
                    withCredentials: true
                });
                setListing(response.data);
            } catch (error: any) {
                console.error('Error fetching listing:', error);
                if (error.response?.status === 401 || error.response?.status === 403) {
                    navigate('/viewer/login');
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
            await axios.post('http://localhost:8000/auth/viewer/logout', {}, {
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1">
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

            <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Address
                        </Typography>
                        <Typography>
                            {listing.address}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Description
                        </Typography>
                        <Typography>
                            {listing.description}
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>

            {listing.photos.length > 0 && (
                <Paper elevation={2} sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Photos
                    </Typography>
                    <ImageList cols={3} gap={16}>
                        {listing.photos.map((photo, index) => (
                            <ImageListItem key={index}>
                                <img
                                    src={photo}
                                    alt={`Listing photo ${index + 1}`}
                                    loading="lazy"
                                    style={{ width: '100%', height: 'auto' }}
                                />
                            </ImageListItem>
                        ))}
                    </ImageList>
                </Paper>
            )}

            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={() => setError(null)} severity="error">
                    {error}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default ListingViewer; 