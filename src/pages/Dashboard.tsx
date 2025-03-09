import axios from 'axios';
import React, { useEffect, useState } from 'react';
import AdminView from './AdminView';
import TenantView from './TenantView';
import ViewerView from './ViewerView';

interface DashboardProps {
    userType: string;
}

const Dashboard: React.FC<DashboardProps> = ({userType}) => {
    return (
        <div style={{ padding: '30px' }}>
            {(() => {
            switch (userType) {
            case 'admin':
            return <AdminView />;
            case 'tenant':
            return <TenantView />;
            case 'viewer':
            return <ViewerView />;
            }
            })()}
        </div>
    );
};

export default Dashboard;