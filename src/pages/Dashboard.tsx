import axios from 'axios';
import React, { useEffect, useState } from 'react';
import AdminView from './AdminView.tsx';

const Dashboard: React.FC = () => {
    return (
        <div>
            {<AdminView />}
        </div>
    );
};

export default Dashboard;