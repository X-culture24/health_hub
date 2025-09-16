import React from 'react';
import { Box, Typography, Alert } from '@mui/material';

const SurgeryScheduling = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Surgery Scheduling
      </Typography>
      <Alert severity="info">
        Surgery scheduling component - Coming soon!
      </Alert>
    </Box>
  );
};

export default SurgeryScheduling;
