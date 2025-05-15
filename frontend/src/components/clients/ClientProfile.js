import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Box,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { clients } from '../../services/api';

const ClientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [client, setClient] = useState(null);
  const [comprehensive, setComprehensive] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    address: '',
    emergency_contact: '',
  });

  const loadClient = useCallback(async () => {
    try {
      const response = await clients.getComprehensiveInfo(id);
      setComprehensive(response.data);
      setClient(response.data.client);
      setFormData(response.data.client);
      setLoading(false);
    } catch (err) {
      setError('Failed to load client details');
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadClient();
  }, [loadClient]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await clients.update(id, formData);
      setClient(formData);
      setEditMode(false);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update client');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!client && !loading) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>
          Client not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">
            Client Profile
          </Typography>
          <Button
            variant="outlined"
            onClick={() => editMode ? setEditMode(false) : navigate('/clients')}
          >
            {editMode ? 'Cancel' : 'Back to List'}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {editMode ? (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="First Name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Date of Birth"
                  name="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Address"
                  name="address"
                  multiline
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Emergency Contact"
                  name="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        ) : (
          <>
            <List>
              <ListItem>
                <ListItemText
                  primary="Name"
                  secondary={`${client.first_name} ${client.last_name}`}
                />
              </ListItem>
              <Divider component="li" />
              <ListItem>
                <ListItemText
                  primary="Email"
                  secondary={client.email}
                />
              </ListItem>
              <Divider component="li" />
              <ListItem>
                <ListItemText
                  primary="Phone"
                  secondary={client.phone}
                />
              </ListItem>
              <Divider component="li" />
              <ListItem>
                <ListItemText
                  primary="Date of Birth"
                  secondary={client.date_of_birth}
                />
              </ListItem>
              <Divider component="li" />
              <ListItem>
                <ListItemText
                  primary="Address"
                  secondary={client.address}
                />
              </ListItem>
              <Divider component="li" />
              <ListItem>
                <ListItemText
                  primary="Emergency Contact"
                  secondary={client.emergency_contact}
                />
              </ListItem>
            </List>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={() => setEditMode(true)}
              >
                Edit Profile
              </Button>
            </Box>
            {comprehensive && (
              <Box mt={4}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="h6">Enrollments</Typography>
                <List>
                  {comprehensive.enrollments && comprehensive.enrollments.length > 0 ? comprehensive.enrollments.map(enrollment => (
                    <ListItem key={enrollment.id}>
                      <ListItemText
                        primary={enrollment.program.name}
                        secondary={`Enrolled by: ${enrollment.enrolled_by || 'N/A'} on ${new Date(enrollment.enrollment_date).toLocaleDateString()}`}
                      />
                    </ListItem>
                  )) : <ListItem><ListItemText primary="No enrollments found." /></ListItem>}
                </List>
                <Typography variant="h6" sx={{ mt: 3 }}>Prescriptions</Typography>
                <List>
                  {comprehensive.prescriptions && comprehensive.prescriptions.length > 0 ? comprehensive.prescriptions.map(prescription => (
                    <ListItem key={prescription.id}>
                      <ListItemText
                        primary={prescription.medication_name}
                        secondary={`Prescribed by: ${prescription.prescribed_by || 'N/A'} on ${new Date(prescription.created_at).toLocaleDateString()}`}
                      />
                    </ListItem>
                  )) : <ListItem><ListItemText primary="No prescriptions found." /></ListItem>}
                </List>
                <Typography variant="h6" sx={{ mt: 3 }}>Appointments</Typography>
                <List>
                  {comprehensive.appointments && comprehensive.appointments.length > 0 ? comprehensive.appointments.map(appointment => (
                    <ListItem key={appointment.id}>
                      <ListItemText
                        primary={`With: ${appointment.scheduled_with || 'N/A'}`}
                        secondary={`On: ${new Date(appointment.scheduled_for).toLocaleString()} | Status: ${appointment.status}`}
                      />
                    </ListItem>
                  )) : <ListItem><ListItemText primary="No appointments found." /></ListItem>}
                </List>
              </Box>
            )}
          </>
        )}
      </Paper>
    </Container>
  );
};

export default ClientProfile; 