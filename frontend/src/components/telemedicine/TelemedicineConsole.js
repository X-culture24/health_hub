import React from 'react';
import { Box, Typography, Alert } from '@mui/material';

const TelemedicineConsole = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Telemedicine Console
      </Typography>
      <Alert severity="info">
        Telemedicine console component - Coming soon!
      </Alert>
    </Box>
  );
};

export default TelemedicineConsole;
