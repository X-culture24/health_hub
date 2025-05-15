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
import { programs } from '../../services/api';
import { clients } from '../../services/api';
import { enrollments } from '../../services/api';

const EnrollmentCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    client_id: '',
    program_id: '',
    notes: ''
  });
  const [availableClients, setAvailableClients] = useState([]);
  const [availablePrograms, setAvailablePrograms] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [clientsResponse, programsResponse] = await Promise.all([
          clients.list(),
          programs.list()
        ]);
        setAvailableClients(clientsResponse.data);
        setAvailablePrograms(programsResponse.data);
      } catch (error) {
        setError('Failed to load data. Please try again.');
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.client_id || !formData.program_id) {
      setError('Please select both a client and a program');
      return;
    }

    try {
      setLoading(true);
      await enrollments.create(formData);
      setSuccess('Client enrolled in program successfully!');
      setTimeout(() => {
        navigate('/enrollments');
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to enroll client in program');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" component="h1" gutterBottom align="center">
            Enroll Client in Program
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
                  <InputLabel id="program-label">Program</InputLabel>
                  <Select
                    labelId="program-label"
                    name="program_id"
                    value={formData.program_id}
                    onChange={handleChange}
                    required
                  >
                    {availablePrograms.map((program) => (
                      <MenuItem key={program.id} value={program.id}>
                        {program.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
                  onClick={() => navigate('/enrollments')}
                  disabled={loading}
                >
                  Back to Enrollments
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? 'Enrolling...' : 'Enroll Client'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default EnrollmentCreate; 