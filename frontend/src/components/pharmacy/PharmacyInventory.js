import React from 'react';
import { Box, Typography, Alert } from '@mui/material';

const PharmacyInventory = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Pharmacy Inventory Management
      </Typography>
      <Alert severity="info">
        Pharmacy inventory management component - Coming soon!
      </Alert>
    </Box>
  );
};

export default PharmacyInventory;
