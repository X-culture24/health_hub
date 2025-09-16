import React from 'react';
import { Box, Typography, Alert } from '@mui/material';

const SurgeryManagement = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Surgery Management
      </Typography>
      <Alert severity="info">
        Surgery management component - Coming soon!
      </Alert>
    </Box>
  );
};

export default SurgeryManagement;
