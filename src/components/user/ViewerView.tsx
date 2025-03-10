import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Typography, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Paper, Button, IconButton, Dialog, DialogTitle, 
    DialogContent, DialogActions, TextField, MenuItem, Stack, Box,
    Snackbar, Alert, CircularProgress, AlertColor
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface Viewer {
    username: string;
    password: string;
    listing_url: string | null;
}

interface ViewerFormData {
    username: string;
    password: string;
    listing_url: string;
}

const initialFormData: ViewerFormData = {
    username: '',
    password: '',
    listing_url: ''
};

interface ViewerFormFieldsProps {
    formData: ViewerFormData;
    onFormChange: (field: keyof ViewerFormData, value: string) => void;
    isEdit: boolean;
}

const UserFormFields = React.memo(({ formData, onFormChange, isEdit }: ViewerFormFieldsProps) => {
    // Password is required for new users and when editing viewer users

    return (
        <Stack spacing={2}>
            <TextField
                required
                label="Username"
                value={formData.username}
                onChange={(e) => onFormChange('username', e.target.value)}
                disabled
            />
            <TextField
                required
                label="Password"
                value={formData.password}
                onChange={(e) => onFormChange('password', e.target.value)}
                helperText={isEdit ? "Leave empty to keep current password" : ""}
            />
            <TextField
                label="Listing URL"
                value={formData.listing_url}
                onChange={(e) => onFormChange('listing_url', e.target.value)}
            />
        </Stack>
    );
});

const ViewerView = () => {
    const navigate = useNavigate();
    const [viewers, setViewers] = useState<Viewer[]>([]);
    const [openCreate, setOpenCreate] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [formData, setFormData] = useState<ViewerFormData>(initialFormData);
    const [selectedViewer, setSelectedViewer] = useState<string | null>(null);
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

    const fetchViewers = () => {
        setLoading(true);
        axios.get('http://localhost:8000/admin/viewer/get', {
            withCredentials: true
        })
            .then(response => {
                if (response.status !== 200) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                setViewers(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the viewers!', error);
                if (error.response?.status === 401 || error.response?.status === 403) {
                    handleAuthError();
                } else {
                    showNotification('Failed to fetch viewers', 'error');
                }
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchViewers();
    }, []);

    const handleFormChange = useCallback((field: keyof ViewerFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleCreateViewer = () => {
        if (!formData.username || !formData.password || !formData.listing_url) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        setLoading(true);
        axios.post('http://localhost:8000/admin/viewer/create', formData, {
            withCredentials: true
        })
            .then(response => {
                setOpenCreate(false);
                setFormData(initialFormData);
                fetchViewers();
                showNotification('Viewer created successfully', 'success');
            })
            .catch(error => {
                console.error('Error creating viewer:', error);
                showNotification(error.response?.data?.message || 'Error creating viewer', 'error');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleUpdateViewer = () => {
        if (!formData.password || !formData.listing_url) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        setLoading(true);
        // Only include password in the update if it was provided
        const updateData = {
            ...formData,
            password: formData.password || undefined
        };

        axios.post('http://localhost:8000/admin/viewer/update', updateData, {
            withCredentials: true
        })
            .then(response => {
                setOpenEdit(false);
                setFormData(formData);
                setSelectedViewer(null);
                fetchViewers();
                showNotification('Viewer updated successfully', 'success');
            })
            .catch(error => {
                console.error('Error updating viewer:', error);
                showNotification(error.response?.data?.message || 'Error updating viewer', 'error');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleDeleteViewer = (username: string) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            setLoading(true);
            axios.post('http://localhost:8000/admin/user/delete', { username }, {
                withCredentials: true
            })
                .then(response => {
                    fetchViewers();
                    showNotification('Viewer deleted successfully', 'success');
                })
                .catch(error => {
                    console.error('Error deleting viewer:', error);
                    if (error.response?.status === 401 || error.response?.status === 403) {
                        handleAuthError();
                    } else {
                        showNotification(error.response?.data?.message || 'Error deleting viewer', 'error');
                    }
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    };

    const handleEditClick = (viewer: Viewer) => {
        setFormData({
            ...viewer,
            password: viewer.password || '',
            listing_url: viewer.listing_url || ''
        });
        setSelectedViewer(viewer.username);
        setOpenEdit(true);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h3" gutterBottom>
                    Current Viewers for Listings
                </Typography>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => {
                        setFormData(initialFormData);
                        setOpenCreate(true);
                    }}
                >
                    Create Viewer
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><b>#</b></TableCell>
                            <TableCell><b>Username</b></TableCell>
                            <TableCell><b>Password</b></TableCell>
                            <TableCell><b>Listing URL</b></TableCell>
                            <TableCell><b>Actions</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {viewers.map((viewer: Viewer, index: number) => (
                            <TableRow key={viewer.username}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{viewer.username}</TableCell>
                                <TableCell>{viewer.password}</TableCell>
                                <TableCell>{viewer.listing_url || '-'}</TableCell>
                                <TableCell>
                                    <IconButton 
                                        color="primary" 
                                        onClick={() => handleEditClick(viewer)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                        color="error" 
                                        onClick={() => handleDeleteViewer(viewer.username)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Viewer for a Listing</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <UserFormFields 
                            formData={formData}
                            onFormChange={handleFormChange}
                            isEdit={false}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
                    <Button onClick={handleCreateViewer} variant="contained" color="primary">
                        Create
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Viewer</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <UserFormFields 
                            formData={formData}
                            onFormChange={handleFormChange}
                            isEdit={true}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
                    <Button onClick={handleUpdateViewer} variant="contained" color="primary">
                        Update
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

export default ViewerView; 