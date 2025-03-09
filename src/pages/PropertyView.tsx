import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Container, Typography, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Paper, Button, IconButton, Dialog, DialogTitle, 
    DialogContent, DialogActions, TextField, Stack, Box,
    Snackbar, Alert, CircularProgress, AlertColor,
    ImageList, ImageListItem, IconButton as MuiIconButton
} from '@mui/material';
import { 
    Edit as EditIcon, 
    Delete as DeleteIcon,
    AddPhotoAlternate as AddPhotoIcon,
    DeleteForever as DeletePhotoIcon
} from '@mui/icons-material';

interface Property {
    id: string;
    name: string;
    address: string;
    description: string;
    bedrooms: Bedroom[];
    photos: string[];  // URLs of the photos
}

interface Bedroom {
    id: string;
    name: string;  // e.g., "Master Bedroom", "Guest Room 1"
    description: string;
    size: string;  // e.g., "15x20 ft"
}

interface PropertyFormData {
    id: string;
    name: string;
    address: string;
    description: string;
    bedrooms: Bedroom[];
    photos: string[];
}

const initialFormData: PropertyFormData = {
    id: '',
    name: '',
    address: '',
    description: '',
    bedrooms: [],
    photos: []
};

interface PropertyFormFieldsProps {
    formData: PropertyFormData;
    onFormChange: (field: keyof PropertyFormData, value: any) => void;
    onAddBedroom: () => void;
    onRemoveBedroom: (index: number) => void;
    onBedroomChange: (index: number, field: keyof Bedroom, value: string) => void;
    onAddPhoto: (file: File) => void;
    onRemovePhoto: (index: number) => void;
    isEdit: boolean;
}

const PropertyFormFields = React.memo(({ 
    formData, 
    onFormChange, 
    onAddBedroom,
    onRemoveBedroom,
    onBedroomChange,
    onAddPhoto,
    onRemovePhoto,
    isEdit 
}: PropertyFormFieldsProps) => {
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
                label="Property ID"
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

            {/* Bedrooms Section */}
            <Box>
                <Typography variant="h6" gutterBottom>
                    Bedrooms
                </Typography>
                {formData.bedrooms.map((bedroom, index) => (
                    <Stack key={index} direction="row" spacing={2} sx={{ mb: 2 }}>
                        <TextField
                            label="Name"
                            value={bedroom.name}
                            onChange={(e) => onBedroomChange(index, 'name', e.target.value)}
                            size="small"
                        />
                        <TextField
                            label="Size"
                            value={bedroom.size}
                            onChange={(e) => onBedroomChange(index, 'size', e.target.value)}
                            size="small"
                        />
                        <TextField
                            label="Description"
                            value={bedroom.description}
                            onChange={(e) => onBedroomChange(index, 'description', e.target.value)}
                            size="small"
                        />
                        <IconButton
                            color="error"
                            onClick={() => onRemoveBedroom(index)}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Stack>
                ))}
                <Button
                    variant="outlined"
                    onClick={onAddBedroom}
                    disabled={formData.bedrooms.length >= 10}
                >
                    Add Bedroom
                </Button>
            </Box>

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
                                alt={`Property photo ${index + 1}`}
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

const PropertyView = () => {
    const navigate = useNavigate();
    const [properties, setProperties] = useState<Property[]>([]);
    const [openCreate, setOpenCreate] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [formData, setFormData] = useState<PropertyFormData>(initialFormData);
    const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
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

    const fetchProperties = () => {
        setLoading(true);
        axios.get('http://localhost:8000/admin/property/get', {
            withCredentials: true
        })
            .then(response => {
                if (response.status !== 200) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                setProperties(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the properties!', error);
                if (error.response?.status === 401 || error.response?.status === 403) {
                    handleAuthError();
                } else {
                    showNotification('Failed to fetch properties', 'error');
                }
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchProperties();
    }, []);

    const handleCreateProperty = () => {
        if (!formData.id || !formData.name || !formData.address) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        setLoading(true);
        axios.post('http://localhost:8000/admin/property/create', formData, {
            withCredentials: true
        })
            .then(response => {
                setOpenCreate(false);
                setFormData(initialFormData);
                fetchProperties();
                showNotification('Property created successfully', 'success');
            })
            .catch(error => {
                console.error('Error creating property:', error);
                if (error.response?.status === 401 || error.response?.status === 403) {
                    handleAuthError();
                } else {
                    showNotification(error.response?.data?.message || 'Error creating property', 'error');
                }
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleEditClick = (property: Property) => {
        setFormData({
            ...property,
            bedrooms: property.bedrooms.map(bedroom => ({
                ...bedroom,
                id: bedroom.id || Date.now().toString()
            }))
        });
        setSelectedProperty(property.id);
        setOpenEdit(true);
    };

    const handleUpdateProperty = () => {
        if (!formData.id || !formData.name || !formData.address) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        setLoading(true);
        axios.post('http://localhost:8000/admin/property/update', formData, {
            withCredentials: true
        })
            .then(response => {
                setOpenEdit(false);
                setFormData(initialFormData);
                setSelectedProperty(null);
                fetchProperties();
                showNotification('Property updated successfully', 'success');
            })
            .catch(error => {
                console.error('Error updating property:', error);
                if (error.response?.status === 401 || error.response?.status === 403) {
                    handleAuthError();
                } else {
                    showNotification(error.response?.data?.message || 'Error updating property', 'error');
                }
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleDeleteProperty = (propertyId: string) => {
        if (window.confirm('Are you sure you want to delete this property?')) {
            setLoading(true);
            axios.post('http://localhost:8000/admin/property/delete', { id: propertyId }, {
                withCredentials: true
            })
                .then(response => {
                    fetchProperties();
                    showNotification('Property deleted successfully', 'success');
                })
                .catch(error => {
                    console.error('Error deleting property:', error);
                    if (error.response?.status === 401 || error.response?.status === 403) {
                        handleAuthError();
                    } else {
                        showNotification(error.response?.data?.message || 'Error deleting property', 'error');
                    }
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    };

    const handleFormChange = useCallback((field: keyof PropertyFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleAddBedroom = useCallback(() => {
        setFormData(prev => ({
            ...prev,
            bedrooms: [
                ...prev.bedrooms,
                { id: Date.now().toString(), name: '', description: '', size: '' }
            ]
        }));
    }, []);

    const handleRemoveBedroom = useCallback((index: number) => {
        setFormData(prev => ({
            ...prev,
            bedrooms: prev.bedrooms.filter((_, i) => i !== index)
        }));
    }, []);

    const handleBedroomChange = useCallback((index: number, field: keyof Bedroom, value: string) => {
        setFormData(prev => ({
            ...prev,
            bedrooms: prev.bedrooms.map((bedroom, i) => 
                i === index ? { ...bedroom, [field]: value } : bedroom
            )
        }));
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
        <Container maxWidth="lg">
            <Typography variant="h2" component="h1" gutterBottom sx={{ mb: 4 }}>
                Property Management
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h3" gutterBottom>
                    Properties
                </Typography>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => {
                        setFormData(initialFormData);
                        setOpenCreate(true);
                    }}
                >
                    Add Property
                </Button>
            </Box>

            {/* Property list table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><b>#</b></TableCell>
                            <TableCell><b>ID</b></TableCell>
                            <TableCell><b>Name</b></TableCell>
                            <TableCell><b>Address</b></TableCell>
                            <TableCell><b>Bedrooms</b></TableCell>
                            <TableCell><b>Photos</b></TableCell>
                            <TableCell><b>Actions</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {properties.map((property, index) => (
                            <TableRow key={property.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{property.id}</TableCell>
                                <TableCell>{property.name}</TableCell>
                                <TableCell>{property.address}</TableCell>
                                <TableCell>{property.bedrooms.length}</TableCell>
                                <TableCell>{property.photos.length}</TableCell>
                                <TableCell>
                                    <IconButton 
                                        color="primary" 
                                        onClick={() => handleEditClick(property)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                        color="error" 
                                        onClick={() => handleDeleteProperty(property.id)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Create/Edit Property Modal */}
            <Dialog 
                open={openCreate || openEdit} 
                onClose={() => openCreate ? setOpenCreate(false) : setOpenEdit(false)}
                maxWidth="md" 
                fullWidth
            >
                <DialogTitle>
                    {openCreate ? 'Add New Property' : 'Edit Property'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <PropertyFormFields 
                            formData={formData}
                            onFormChange={handleFormChange}
                            onAddBedroom={handleAddBedroom}
                            onRemoveBedroom={handleRemoveBedroom}
                            onBedroomChange={handleBedroomChange}
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
                        onClick={openCreate ? handleCreateProperty : handleUpdateProperty} 
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
        </Container>
    );
};

export default PropertyView; 