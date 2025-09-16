import React from 'react';
import { Box, Typography, Alert } from '@mui/material';

const DepartmentManagement = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Department Management
      </Typography>
      <Alert severity="info">
        Department management component - Coming soon!
      </Alert>
    </Box>
  );
};

export default DepartmentManagement;
