import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Container, Typography, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Paper, Button, IconButton, Dialog, DialogTitle, 
    DialogContent, DialogActions, TextField, Stack, Box,
    Snackbar, Alert, CircularProgress, AlertColor,
    ImageList, ImageListItem
} from '@mui/material';
import { 
    Edit as EditIcon, 
    Delete as DeleteIcon,
    AddPhotoAlternate as AddPhotoIcon,
    DeleteForever as DeletePhotoIcon
} from '@mui/icons-material';

interface Listing {
    id: string;
    name: string;
    address: string;
    description: string;
    photos: string[];  // URLs of the photos
}

interface ListingFormData {
    id: string;
    name: string;
    address: string;
    description: string;
    photos: string[];
}

const initialFormData: ListingFormData = {
    id: '',
    name: '',
    address: '',
    description: '',
    photos: []
};

interface ListingFormFieldsProps {
    formData: ListingFormData;
    onFormChange: (field: keyof ListingFormData, value: any) => void;
    onAddPhoto: (file: File) => void;
    onRemovePhoto: (index: number) => void;
    isEdit: boolean;
}

const ListingFormFields = React.memo(({ 
    formData, 
    onFormChange, 
    onAddPhoto,
    onRemovePhoto,
    isEdit 
}: ListingFormFieldsProps) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onAddPhoto(file);
        }
    };

    return (
        <Stack spacing={3}>
            <TextField
                required
                label="Listing ID"
                value={formData.id}
                onChange={(e) => onFormChange('id', e.target.value)}
                disabled={isEdit}
            />
            <TextField
                required
                label="Name"
                value={formData.name}
                onChange={(e) => onFormChange('name', e.target.value)}
            />
            <TextField
                required
                label="Address"
                value={formData.address}
                onChange={(e) => onFormChange('address', e.target.value)}
                multiline
                rows={2}
            />
            <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => onFormChange('description', e.target.value)}
                multiline
                rows={3}
            />

            {/* Photos Section */}
            <Box>
                <Typography variant="h6" gutterBottom>
                    Photos
                </Typography>
                <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />
                <Button
                    variant="outlined"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={formData.photos.length >= 10}
                    startIcon={<AddPhotoIcon />}
                >
                    Add Photo
                </Button>
                <ImageList sx={{ mt: 2 }} cols={3} rowHeight={164}>
                    {formData.photos.map((photo, index) => (
                        <ImageListItem key={index}>
                            <img
                                src={photo}
                                alt={`Listing photo ${index + 1}`}
                                loading="lazy"
                            />
                            <IconButton
                                sx={{
                                    position: 'absolute',
                                    right: 4,
                                    top: 4,
                                    bgcolor: 'rgba(255, 255, 255, 0.7)'
                                }}
                                onClick={() => onRemovePhoto(index)}
                            >
                                <DeletePhotoIcon />
                            </IconButton>
                        </ImageListItem>
                    ))}
                </ImageList>
            </Box>
        </Stack>
    );
});

const ListingView = () => {
    const navigate = useNavigate();
    const [listings, setListings] = useState<Listing[]>([]);
    const [openCreate, setOpenCreate] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [formData, setFormData] = useState<ListingFormData>(initialFormData);
    const [selectedListing, setSelectedListing] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState<{
        open: boolean;
        message: string;
        severity: AlertColor;
    }>({
        open: false,
        message: '',
        severity: 'success'
    });

    const showNotification = (message: string, severity: AlertColor) => {
        setNotification({
            open: true,
            message,
            severity
        });
    };

    const handleCloseNotification = () => {
        setNotification(prev => ({ ...prev, open: false }));
    };

    const handleAuthError = () => {
        showNotification('Please log in again', 'error');
        navigate('/login');
    };

    const fetchListings = () => {
        setLoading(true);
        axios.get('http://localhost:8000/admin/listing/get', {
            withCredentials: true
        })
            .then(response => {
                if (response.status !== 200) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                setListings(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the listings!', error);
                if (error.response?.status === 401 || error.response?.status === 403) {
                    handleAuthError();
                } else {
                    showNotification('Failed to fetch listings', 'error');
                }
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchListings();
    }, []);

    const handleCreateListing = () => {
        if (!formData.id || !formData.name || !formData.address) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        setLoading(true);
        axios.post('http://localhost:8000/admin/listing/create', formData, {
            withCredentials: true
        })
            .then(response => {
                setOpenCreate(false);
                setFormData(initialFormData);
                fetchListings();
                showNotification('Listing created successfully', 'success');
            })
            .catch(error => {
                console.error('Error creating listing:', error);
                if (error.response?.status === 401 || error.response?.status === 403) {
                    handleAuthError();
                } else {
                    showNotification(error.response?.data?.message || 'Error creating listing', 'error');
                }
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleEditClick = (listing: Listing) => {
        setFormData({
            ...listing
        });
        setSelectedListing(listing.id);
        setOpenEdit(true);
    };

    const handleUpdateListing = () => {
        if (!formData.id || !formData.name || !formData.address) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        setLoading(true);
        axios.post('http://localhost:8000/admin/listing/update', formData, {
            withCredentials: true
        })
            .then(response => {
                setOpenEdit(false);
                setFormData(initialFormData);
                setSelectedListing(null);
                fetchListings();
                showNotification('Listing updated successfully', 'success');
            })
            .catch(error => {
                console.error('Error updating listing:', error);
                if (error.response?.status === 401 || error.response?.status === 403) {
                    handleAuthError();
                } else {
                    showNotification(error.response?.data?.message || 'Error updating listing', 'error');
                }
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleDeleteListing = (listingId: string) => {
        if (window.confirm('Are you sure you want to delete this listing?')) {
            setLoading(true);
            axios.post('http://localhost:8000/admin/listing/delete', { id: listingId }, {
                withCredentials: true
            })
                .then(response => {
                    fetchListings();
                    showNotification('Listing deleted successfully', 'success');
                })
                .catch(error => {
                    console.error('Error deleting listing:', error);
                    if (error.response?.status === 401 || error.response?.status === 403) {
                        handleAuthError();
                    } else {
                        showNotification(error.response?.data?.message || 'Error deleting listing', 'error');
                    }
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    };

    const handleFormChange = useCallback((field: keyof ListingFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleAddPhoto = useCallback((file: File) => {
        // In a real app, you'd upload this to a server and get back a URL
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({
                ...prev,
                photos: [...prev.photos, reader.result as string]
            }));
        };
        reader.readAsDataURL(file);
    }, []);

    const handleRemovePhoto = useCallback((index: number) => {
        setFormData(prev => ({
            ...prev,
            photos: prev.photos.filter((_, i) => i !== index)
        }));
    }, []);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h3" gutterBottom>
                    Listings
                </Typography>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => {
                        setFormData(initialFormData);
                        setOpenCreate(true);
                    }}
                >
                    Add Listing
                </Button>
            </Box>

            {/* Listing list table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><b>#</b></TableCell>
                            <TableCell><b>ID</b></TableCell>
                            <TableCell><b>Name</b></TableCell>
                            <TableCell><b>Address</b></TableCell>
                            <TableCell><b>Photos</b></TableCell>
                            <TableCell><b>Actions</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {listings.map((listing, index) => (
                            <TableRow key={listing.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{listing.id}</TableCell>
                                <TableCell>{listing.name}</TableCell>
                                <TableCell>{listing.address}</TableCell>
                                <TableCell>{listing.photos.length}</TableCell>
                                <TableCell>
                                    <IconButton 
                                        color="primary" 
                                        onClick={() => handleEditClick(listing)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                        color="error" 
                                        onClick={() => handleDeleteListing(listing.id)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Create/Edit Listing Modal */}
            <Dialog 
                open={openCreate || openEdit} 
                onClose={() => openCreate ? setOpenCreate(false) : setOpenEdit(false)}
                maxWidth="md" 
                fullWidth
            >
                <DialogTitle>
                    {openCreate ? 'Add New Listing' : 'Edit Listing'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <ListingFormFields 
                            formData={formData}
                            onFormChange={handleFormChange}
                            onAddPhoto={handleAddPhoto}
                            onRemovePhoto={handleRemovePhoto}
                            isEdit={openEdit}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => openCreate ? setOpenCreate(false) : setOpenEdit(false)}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={openCreate ? handleCreateListing : handleUpdateListing} 
                        variant="contained" 
                        color="primary"
                    >
                        {openCreate ? 'Create' : 'Update'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Loading Overlay */}
            {loading && (
                <Box sx={{ 
                    position: 'fixed', 
                    top: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '100%', 
                    bgcolor: 'rgba(255, 255, 255, 0.7)', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    zIndex: 9999
                }}>
                    <CircularProgress />
                </Box>
            )}

            {/* Notifications */}
            <Snackbar 
                open={notification.open} 
                autoHideDuration={6000} 
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert 
                    onClose={handleCloseNotification} 
                    severity={notification.severity}
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ListingView; 