import React from 'react';
import { Box, Typography, Alert } from '@mui/material';

const SystemSettings = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        System Settings
      </Typography>
      <Alert severity="info">
        System settings component - Coming soon!
      </Alert>
    </Box>
  );
};

export default SystemSettings;
