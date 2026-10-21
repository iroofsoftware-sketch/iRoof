import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { roleHomePaths } from './auth/LoginPage';

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { role, logout } = useAuthStore();

  const handleReturn = () => {
    if (role && roleHomePaths[role]) {
      navigate(roleHomePaths[role]);
    } else {
      navigate('/login');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8fafc',
      padding: '24px'
    }}>
      <Result
        status="403"
        title="403 - Access Denied"
        subTitle="You do not have permission to view this department's resources."
        extra={[
          <Button type="primary" key="home" onClick={handleReturn}>
            Back to My Dashboard
          </Button>,
          <Button key="logout" onClick={() => { logout(); navigate('/login'); }}>
            Sign Out
          </Button>
        ]}
      />
    </div>
  );
};

export default UnauthorizedPage;
