import React from 'react';
import { Box, Typography, Alert } from '@mui/material';

const StaffManagement = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Staff Management
      </Typography>
      <Alert severity="info">
        Staff management component - Coming soon!
      </Alert>
    </Box>
  );
};

export default StaffManagement;
