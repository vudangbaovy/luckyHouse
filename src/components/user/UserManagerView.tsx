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

interface User {
    username: string;
    user_type: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone: string | null;
    listing_url: string | null;
}

interface UserFormData {
    username: string;
    password: string;
    user_type: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    listing_url: string;
}

const initialFormData: UserFormData = {
    username: '',
    password: '',
    user_type: 'viewer',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    listing_url: ''
};

interface UserFormFieldsProps {
    formData: UserFormData;
    onFormChange: (field: keyof UserFormData, value: string) => void;
    isEdit: boolean;
}

const UserFormFields = React.memo(({ formData, onFormChange, isEdit }: UserFormFieldsProps) => {
    // Password is required for new users and when editing viewer users
    const isPasswordRequired = !isEdit || (isEdit && formData.user_type === 'viewer');
    const [listingUrls, setListingUrls] = useState<string[]>([]);

    useEffect(() => {
        axios.get('http://localhost:8000/admin/listing/get', {
            withCredentials: true
        })
        .then(response => {
            setListingUrls(response.data.map((listing: { url: string }) => listing.url));
        })
        .catch(error => {
            console.error('Error fetching listing URLs:', error);
        });
    }, []);

    return (
        <Stack spacing={2}>
            <TextField
                required
                label="Username"
                value={formData.username}
                onChange={(e) => onFormChange('username', e.target.value)}
                disabled={isEdit}
            />
            {(isPasswordRequired || !isEdit) && (
                <TextField
                    required={isPasswordRequired}
                    type="password"
                    label={isPasswordRequired ? "Password" : "Password (Optional)"}
                    value={formData.password}
                    onChange={(e) => onFormChange('password', e.target.value)}
                    helperText={isEdit ? "Leave empty to keep current password" : ""}
                />
            )}
            <TextField
                select
                required
                label="Role"
                value={formData.user_type}
                onChange={(e) => onFormChange('user_type', e.target.value)}
            >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="viewer">Viewer</MenuItem>
                <MenuItem value="tenant">Tenant</MenuItem>
            </TextField>
            <TextField
                label="First Name"
                value={formData.first_name}
                onChange={(e) => onFormChange('first_name', e.target.value)}
            />
            <TextField
                label="Last Name"
                value={formData.last_name}
                onChange={(e) => onFormChange('last_name', e.target.value)}
            />
            <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => onFormChange('email', e.target.value)}
            />
            <TextField
                label="Phone"
                value={formData.phone}
                onChange={(e) => onFormChange('phone', e.target.value)}
            />
            <TextField
                select
                label="Listing URL"
                value={formData.listing_url}
                onChange={(e) => onFormChange('listing_url', e.target.value)}
            >
                {listingUrls.map((url) => (
                    <MenuItem key={url} value={url}>
                        {url}
                    </MenuItem>
                ))}
            </TextField>
        </Stack>
    );
});

const UserView = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [openCreate, setOpenCreate] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [formData, setFormData] = useState<UserFormData>(initialFormData);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
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

    const fetchUsers = () => {
        setLoading(true);
        axios.get('http://localhost:8000/admin/user/get', {
            withCredentials: true
        })
            .then(response => {
                if (response.status !== 200) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                setUsers(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the users!', error);
                if (error.response?.status === 401 || error.response?.status === 403) {
                    handleAuthError();
                } else {
                    showNotification('Failed to fetch users', 'error');
                }
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleFormChange = useCallback((field: keyof UserFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleCreateUser = () => {
        if (!formData.username || !formData.password || !formData.user_type) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        setLoading(true);
        axios.post('http://localhost:8000/admin/user/create', formData, {
            withCredentials: true
        })
            .then(response => {
                setOpenCreate(false);
                setFormData(initialFormData);
                fetchUsers();
                showNotification('User created successfully', 'success');
            })
            .catch(error => {
                console.error('Error creating user:', error);
                showNotification(error.response?.data?.message || 'Error creating user', 'error');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleUpdateUser = () => {
        if (!formData.username || !formData.user_type) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        // Check if password is required for this update
        if (formData.user_type === 'viewer' && !formData.password) {
            showNotification('Password is required for viewer users', 'error');
            return;
        }

        setLoading(true);
        // Only include password in the update if it was provided
        const updateData = {
            ...formData,
            password: formData.password || undefined
        };

        axios.post('http://localhost:8000/admin/user/update', updateData, {
            withCredentials: true
        })
            .then(response => {
                setOpenEdit(false);
                setFormData(initialFormData);
                setSelectedUser(null);
                fetchUsers();
                showNotification('User updated successfully', 'success');
            })
            .catch(error => {
                console.error('Error updating user:', error);
                showNotification(error.response?.data?.message || 'Error updating user', 'error');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleDeleteUser = (username: string) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            setLoading(true);
            axios.post('http://localhost:8000/admin/user/delete', { username }, {
                withCredentials: true
            })
                .then(response => {
                    fetchUsers();
                    showNotification('User deleted successfully', 'success');
                })
                .catch(error => {
                    console.error('Error deleting user:', error);
                    if (error.response?.status === 401 || error.response?.status === 403) {
                        handleAuthError();
                    } else {
                        showNotification(error.response?.data?.message || 'Error deleting user', 'error');
                    }
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    };

    const handleEditClick = (user: User) => {
        setFormData({
            ...user,
            password: '', // Don't populate password
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            email: user.email || '',
            phone: user.phone || '',
            listing_url: user.listing_url || ''
        });
        setSelectedUser(user.username);
        setOpenEdit(true);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h3" gutterBottom>
                    Current Users
                </Typography>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => {
                        setFormData(initialFormData);
                        setOpenCreate(true);
                    }}
                >
                    Create User
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><b>#</b></TableCell>
                            <TableCell><b>Username</b></TableCell>
                            <TableCell><b>Role</b></TableCell>
                            <TableCell><b>First Name</b></TableCell>
                            <TableCell><b>Last Name</b></TableCell>
                            <TableCell><b>Email</b></TableCell>
                            <TableCell><b>Phone</b></TableCell>
                            <TableCell><b>Listing URL</b></TableCell>
                            <TableCell><b>Actions</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user: User, index: number) => (
                            <TableRow key={user.username}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{user.username}</TableCell>
                                <TableCell>{user.user_type}</TableCell>
                                <TableCell>{user.first_name || '-'}</TableCell>
                                <TableCell>{user.last_name || '-'}</TableCell>
                                <TableCell>{user.email || '-'}</TableCell>
                                <TableCell>{user.phone || '-'}</TableCell>
                                <TableCell>{user.listing_url || '-'}</TableCell>
                                <TableCell>
                                    <IconButton 
                                        color="primary" 
                                        onClick={() => handleEditClick(user)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                        color="error" 
                                        onClick={() => handleDeleteUser(user.username)}
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
                <DialogTitle>Create New User</DialogTitle>
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
                    <Button onClick={handleCreateUser} variant="contained" color="primary">
                        Create
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit User</DialogTitle>
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
                    <Button onClick={handleUpdateUser} variant="contained" color="primary">
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

export default UserView; 