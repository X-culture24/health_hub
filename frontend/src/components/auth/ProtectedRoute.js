import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authAPI from '../../services/authAPI';

const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    const isAuthenticated = authAPI.isAuthenticated();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute; 