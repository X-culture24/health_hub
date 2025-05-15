import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Autocomplete,
  Grid
} from '@mui/material';
import { programs } from '../services/api';

const predefinedPrograms = [
  { name: 'Tuberculosis (TB) Treatment', description: 'Comprehensive TB treatment and monitoring program' },
  { name: 'Malaria Prevention', description: 'Malaria prevention and treatment program' },
  { name: 'HIV/AIDS Care', description: 'HIV/AIDS treatment and support program' },
  { name: 'Diabetes Management', description: 'Diabetes care and management program' },
  { name: 'Hypertension Control', description: 'Blood pressure monitoring and control program' },
  { name: 'Maternal Health', description: 'Prenatal and postnatal care program' },
  { name: 'Child Immunization', description: 'Childhood vaccination program' },
  { name: 'Mental Health Support', description: 'Mental health counseling and support program' },
  { name: 'Nutrition Counseling', description: 'Dietary and nutrition guidance program' },
  { name: 'Chronic Disease Management', description: 'General chronic disease management program' }
];

const ProgramForm = () => {
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [customDescription, setCustomDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedProgram) {
      setError('Please select a program');
      return;
    }

    try {
      await programs.create({
        name: selectedProgram.name,
        description: customDescription || selectedProgram.description
      });
      setSuccess('Program created successfully');
      navigate('/programs');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create program');
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" component="h1" gutterBottom align="center">
            Create Health Program
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Autocomplete
              options={predefinedPrograms}
              getOptionLabel={(option) => option.name}
              value={selectedProgram}
              onChange={(event, newValue) => {
                setSelectedProgram(newValue);
                setCustomDescription('');
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Program"
                  required
                  fullWidth
                  margin="normal"
                />
              )}
            />

            <TextField
              margin="normal"
              fullWidth
              multiline
              rows={4}
              label="Program Description"
              value={customDescription || (selectedProgram?.description || '')}
              onChange={(e) => setCustomDescription(e.target.value)}
              disabled={!selectedProgram}
            />

            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate('/programs')}
                >
                  Back to Programs
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={!selectedProgram}
                >
                  Create Program
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default ProgramForm; 