import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import { clients } from '../../services/api';
import { metrics } from '../../services/api';

const MetricRecord = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    client_id: '',
    name: '',
    value: '',
    unit: '',
    notes: ''
  });
  const [availableClients, setAvailableClients] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Common metric types with their units
  const metricTypes = [
    { name: 'Blood Pressure', unit: 'mmHg' },
    { name: 'Heart Rate', unit: 'bpm' },
    { name: 'Temperature', unit: '°C' },
    { name: 'Weight', unit: 'kg' },
    { name: 'Height', unit: 'cm' },
    { name: 'BMI', unit: '' },
    { name: 'Blood Sugar', unit: 'mg/dL' },
    { name: 'Cholesterol', unit: 'mg/dL' },
    { name: 'Oxygen Saturation', unit: '%' },
    { name: 'Respiratory Rate', unit: 'breaths/min' }
  ];

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const response = await clients.list();
        setAvailableClients(response.data);
      } catch (error) {
        setError('Failed to load clients. Please try again.');
        console.error('Error fetching clients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'name') {
      // When metric name changes, set the appropriate unit
      const selectedMetric = metricTypes.find(metric => metric.name === value);
      setFormData({
        ...formData,
        [name]: value,
        unit: selectedMetric ? selectedMetric.unit : ''
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.client_id || !formData.name || !formData.value) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await metrics.record(formData);
      setSuccess('Metric recorded successfully!');
      setTimeout(() => {
        navigate('/metrics');
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to record metric');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" component="h1" gutterBottom align="center">
            Record Health Metric
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
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="client-label">Client</InputLabel>
                  <Select
                    labelId="client-label"
                    name="client_id"
                    value={formData.client_id}
                    onChange={handleChange}
                    required
                  >
                    {availableClients.map((client) => (
                      <MenuItem key={client.id} value={client.id}>
                        {client.first_name} {client.last_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="metric-label">Metric Type</InputLabel>
                  <Select
                    labelId="metric-label"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  >
                    {metricTypes.map((metric) => (
                      <MenuItem key={metric.name} value={metric.name}>
                        {metric.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Value"
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                  required
                  type="number"
                  inputProps={{ step: "any" }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  required
                  disabled
                />
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

              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate('/metrics')}
                  disabled={loading}
                >
                  Back to Metrics
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? 'Recording...' : 'Record Metric'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default MetricRecord; 