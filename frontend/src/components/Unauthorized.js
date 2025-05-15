import React from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" color="error" gutterBottom>
          Unauthorized Access
        </Typography>
        <Typography variant="body1" paragraph>
          You do not have permission to access this page. Please log in with appropriate credentials or contact your administrator.
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/login')}
            sx={{ mr: 2 }}
          >
            Go to Login
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Unauthorized; 