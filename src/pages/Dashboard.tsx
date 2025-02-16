import axios from 'axios';
import React, { useEffect, useState } from 'react';
import AdminView from './AdminView.tsx';
import TenantView from './TenantView.tsx';
import ViewerView from './ViewerView.tsx';

const Dashboard = () => {
    const [userType, setUserType] = useState<string>('');

    const fetchData = async () => {
        try {
          const response = await axios.get('http://localhost:8000/auth/user', { withCredentials: true });
          const userType = await response.data['user_type'];
          setUserType(userType);
        } catch (error) {
          console.error('Error fetching data: ', error);
        }
    };

    useEffect(() => {
        fetchData();
      }, []);

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