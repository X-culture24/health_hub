import React from 'react';
import { Box, Typography, Alert } from '@mui/material';

const PaymentManagement = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Payment Management
      </Typography>
      <Alert severity="info">
        Payment management component - Coming soon!
      </Alert>
    </Box>
  );
};

export default PaymentManagement;
