import React, { useState, memo } from 'react';
import { 
    Container, Typography, Box, Tabs, Tab
} from '@mui/material';
import ListingView from '../components/listing/ListingView';
import UserView from '../components/user/UserView';
import ViewerView from '../components/user/ViewerView';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`admin-tabpanel-${index}`}
            aria-labelledby={`admin-tab-${index}`}
            {...other}
            style={{ marginTop: '24px' }}
        >
            {value === index && children}
        </div>
    );
}

const UserManagementPanel = memo(() => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <UserView />
            <ViewerView />
        </Box>
    );
});

const ListingManagementPanel = memo(() => {
    return <ListingView />;
});

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
                <UserManagementPanel />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
                <ListingManagementPanel />
            </TabPanel>
        </Container>
    );
};

export default AdminView;