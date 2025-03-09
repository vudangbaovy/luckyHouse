import React, { useState } from 'react';
import { 
    Container, Typography, Box, Tabs, Tab
} from '@mui/material';
import ListingView from '../components/listing/ListingView';
import UserView from '../components/user/UserView';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <Box
            role="tabpanel"
            id={`admin-tabpanel-${index}`}
            aria-labelledby={`admin-tab-${index}`}
            {...other}
            sx={{
                display: value !== index ? 'none' : 'block',
                mt: 3
            }}
        >
            {children}
        </Box>
    );
}

const AdminView = () => {
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    return (
        <Container maxWidth="lg">
            <Typography variant="h2" component="h1" gutterBottom sx={{ mb: 4 }}>
                ADMIN DASHBOARD
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin tabs">
                    <Tab label="User Management" />
                    <Tab label="Listing Management" />
                </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
                <UserView />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
                <ListingView />
            </TabPanel>
        </Container>
    );
};

export default AdminView;