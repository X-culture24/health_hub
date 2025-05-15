import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import ProgramForm from '../ProgramForm';

const ProgramCreate = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create Health Program
        </Typography>
        <ProgramForm />
      </Box>
    </Container>
  );
};

export default ProgramCreate; 