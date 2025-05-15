import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import prescriptionAPI from '../services/prescriptionAPI';

const PrescriptionEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [prescription, setPrescription] = useState({
    medication_name: '',
    dosage: '',
    frequency: '',
    duration: '',
    notes: '',
    client: null,
    prescribed_by: null,
  });

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        const response = await prescriptionAPI.getPrescription(id);
        setPrescription(response);
        setLoading(false);
      } catch (err) {
        setError('Failed to load prescription details');
        setLoading(false);
      }
    };

    fetchPrescription();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPrescription(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      await prescriptionAPI.updatePrescription(id, {
        medication_name: prescription.medication_name,
        dosage: prescription.dosage,
        frequency: prescription.frequency,
        duration: prescription.duration,
        notes: prescription.notes,
      });
      
      setSuccess('Prescription updated successfully');
      setTimeout(() => {
        navigate('/prescriptions');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update prescription');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Edit Prescription
        </Typography>
        
        {prescription.client && (
          <Typography variant="subtitle1" gutterBottom>
            Patient: {prescription.client.first_name} {prescription.client.last_name}
          </Typography>
        )}

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
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Medication Name"
                name="medication_name"
                value={prescription.medication_name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Dosage"
                name="dosage"
                value={prescription.dosage}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Frequency"
                name="frequency"
                value={prescription.frequency}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Duration"
                name="duration"
                value={prescription.duration}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={prescription.notes}
                onChange={handleChange}
                multiline
                rows={4}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
            >
              Save Changes
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/prescriptions')}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default PrescriptionEdit; 