import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { clients } from '../../services/api';
import axios from 'axios';

const ENCOUNTER_TYPES = [
  'Consultation',
  'Follow-up',
  'Emergency',
  'Routine'
];
const ENCOUNTER_STATUSES = [
  'Scheduled',
  'Completed',
  'Cancelled',
  'No Show'
];

const EncounterCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [clientList, setClientList] = useState([]);
  const [formData, setFormData] = useState({
    client_id: '',
    encounter_type: 'Consultation',
    scheduled_for: '',
    status: 'Scheduled',
    notes: ''
  });

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (clientList.length > 0 && !formData.client_id) {
      setFormData((prev) => ({ ...prev, client_id: clientList[0].id }));
    }
    if (clientList.length === 0) {
      setError('No clients available. Please add a client first.');
    }
    // eslint-disable-next-line
  }, [clientList]);

  const fetchClients = async () => {
    try {
      const response = await clients.list();
      setClientList(response.data);
    } catch (err) {
      setError('Failed to fetch clients. Please try again later.');
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'client_id' ? Number(value) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.client_id || !formData.scheduled_for) {
      setError('Please fill in all required fields.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const payload = {
        client_id: Number(formData.client_id),
        encounter_type: formData.encounter_type,
        scheduled_for: formData.scheduled_for,
        status: formData.status,
        notes: formData.notes || ''
      };
      await axios.post('http://localhost:8000/api/encounters/create/', payload, {
        headers: { Authorization: `Token ${token}` }
      });
      setSuccess(true);
      setFormData({
        client_id: clientList[0]?.id || '',
        encounter_type: 'Consultation',
        scheduled_for: '',
        status: 'Scheduled',
        notes: ''
      });
      setTimeout(() => {
        navigate('/encounters');
      }, 2000);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError(err.message || 'Failed to create encounter. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Create New Encounter
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Encounter created successfully! Redirecting...
        </Alert>
      )}
      <Paper sx={{ p: 3, mt: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required disabled={clientList.length === 0}>
                <InputLabel id="client-label">Client</InputLabel>
                <Select
                  labelId="client-label"
                  name="client_id"
                  value={formData.client_id}
                  onChange={handleChange}
                  label="Client"
                >
                  {clientList.map((client) => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.first_name} {client.last_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel id="encounter-type-label">Encounter Type</InputLabel>
                <Select
                  labelId="encounter-type-label"
                  name="encounter_type"
                  value={formData.encounter_type}
                  onChange={handleChange}
                  label="Encounter Type"
                >
                  {ENCOUNTER_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date and Time"
                type="datetime-local"
                name="scheduled_for"
                value={formData.scheduled_for}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  {ENCOUNTER_STATUSES.map((status) => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/encounters')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading || clientList.length === 0}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? 'Creating...' : 'Create Encounter'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default EncounterCreate; 