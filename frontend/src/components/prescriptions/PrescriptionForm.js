import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  MenuItem
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { prescriptions, clients } from '../../services/api';

const PrescriptionForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientList, setClientList] = useState([]);
  const [formData, setFormData] = useState({
    client: '',
    medication_name: '',
    dosage: '',
    frequency: '',
    start_date: null,
    end_date: null,
    notes: ''
  });

  useEffect(() => {
    fetchClients();
    if (isEditMode) {
      fetchPrescription();
    }
  }, [isEditMode, id]);

  const fetchClients = async () => {
    try {
      const data = await clients.list();
      setClientList(data);
    } catch (err) {
      setError('Failed to fetch clients. Please try again later.');
      console.error(err);
    }
  };

  const fetchPrescription = async () => {
    try {
      setLoading(true);
      const data = await prescriptions.get(id);
      setFormData({
        ...data,
        start_date: new Date(data.start_date),
        end_date: data.end_date ? new Date(data.end_date) : null
      });
    } catch (err) {
      setError('Failed to fetch prescription details. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (name) => (date) => {
    setFormData(prev => ({
      ...prev,
      [name]: date
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const prescriptionData = {
        ...formData,
        start_date: formData.start_date.toISOString().split('T')[0],
        end_date: formData.end_date ? formData.end_date.toISOString().split('T')[0] : null
      };

      if (isEditMode) {
        await prescriptions.update(id, prescriptionData);
      } else {
        await prescriptions.create(prescriptionData);
      }

      navigate('/prescriptions');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save prescription. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {isEditMode ? 'Edit Prescription' : 'New Prescription'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                select
                required
                fullWidth
                label="Client"
                name="client"
                value={formData.client}
                onChange={handleChange}
              >
                {clientList.map((client) => (
                  <MenuItem key={client.id} value={client.id}>
                    {client.first_name} {client.last_name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Medication Name"
                name="medication_name"
                value={formData.medication_name}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Dosage"
                name="dosage"
                value={formData.dosage}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Frequency"
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={formData.start_date}
                  onChange={handleDateChange('start_date')}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={formData.end_date}
                  onChange={handleDateChange('end_date')}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end">
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
                  {loading ? <CircularProgress size={24} /> : 'Save'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default PrescriptionForm; 