import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Button, Container, Box } from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import axios from 'axios';

const TenantView = () => {
    const navigate = useNavigate();
    const [listingUrl, setListingUrl] = useState<string | null>(null);

    useEffect(() => {
        // Fetch the current user's info to get their listing_url
        axios.get('http://localhost:8000/auth/', { withCredentials: true })
            .then(response => {
                if (response.data.listing_url) {
                    setListingUrl(response.data.listing_url);
                }
            })
            .catch(error => {
                console.error('Error fetching user info:', error);
            });
    }, []);

    return (
        <Container maxWidth="sm">
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: 3, 
                mt: 4 
            }}>
                <Typography variant="h1" gutterBottom>
                    Tenant Dashboard
                </Typography>
                {listingUrl && (
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        startIcon={<VisibilityIcon />}
                        onClick={() => navigate(`/listing/${listingUrl}`)}
                    >
                        View My Room
                    </Button>
                )}
            </Box>
        </Container>
    );
};

export default TenantView;