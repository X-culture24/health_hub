import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  Paper
} from '@mui/material';
import { prescriptions, clients } from '../../services/api';

const PrescriptionCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [clientList, setClientList] = useState([]);
  const [formData, setFormData] = useState({
    client_id: '',
    medication_name: '',
    dosage: '',
    frequency: '',
    start_date: '',
    end_date: '',
    notes: ''
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await clients.list();
      setClientList(response);
    } catch (err) {
      setError('Failed to fetch clients. Please try again later.');
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.client_id || !formData.medication_name || !formData.dosage || !formData.frequency || !formData.start_date) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const prescriptionData = {
        ...formData,
        end_date: formData.end_date || null
      };

      await prescriptions.create(prescriptionData);
      setSuccess(true);
      
      // Reset form after successful creation
      setFormData({
        client_id: '',
        medication_name: '',
        dosage: '',
        frequency: '',
        start_date: '',
        end_date: '',
        notes: ''
      });

      // Redirect to prescriptions list after a short delay
      setTimeout(() => {
        navigate('/prescriptions');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to create prescription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Create New Prescription
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Prescription created successfully! Redirecting...
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="client-label">Client</InputLabel>
            <Select
              labelId="client-label"
              name="client_id"
              value={formData.client_id}
              onChange={handleChange}
              label="Client"
              required
            >
              {clientList.map((client) => (
                <MenuItem key={client.id} value={client.id}>
                  {client.first_name} {client.last_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Medication Name"
            name="medication_name"
            value={formData.medication_name}
            onChange={handleChange}
            sx={{ mb: 2 }}
            required
          />

          <TextField
            fullWidth
            label="Dosage"
            name="dosage"
            value={formData.dosage}
            onChange={handleChange}
            sx={{ mb: 2 }}
            required
          />

          <TextField
            fullWidth
            label="Frequency"
            name="frequency"
            value={formData.frequency}
            onChange={handleChange}
            sx={{ mb: 2 }}
            required
          />

          <TextField
            fullWidth
            label="Start Date"
            name="start_date"
            type="date"
            value={formData.start_date}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
            required
          />

          <TextField
            fullWidth
            label="End Date (Optional)"
            name="end_date"
            type="date"
            value={formData.end_date}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Notes"
            name="notes"
            multiline
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/prescriptions')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Prescription'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default PrescriptionCreate; 