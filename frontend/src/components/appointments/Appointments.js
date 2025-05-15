import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { appointments, clients } from '../../services/api';
import { format } from 'date-fns';

const Appointments = () => {
  const [appointmentList, setAppointmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [clientList, setClientList] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [reason, setReason] = useState('');
  const [dialogError, setDialogError] = useState(null);

  useEffect(() => {
    fetchAppointments();
    fetchClients();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointments.list();
      setAppointmentList(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch appointments. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await clients.list();
      setClientList(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Failed to fetch clients:', err);
      setClientList([]);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedClient('');
    setScheduledFor('');
    setReason('');
    setDialogError(null);
  };

  const handleCreateAppointment = async () => {
    if (!selectedClient || !scheduledFor) {
      setDialogError('Please fill in all required fields');
      return;
    }

    try {
      const appointmentData = {
        client_id: selectedClient,
        scheduled_for: scheduledFor,
        reason: reason
      };

      await appointments.create(appointmentData);
      handleCloseDialog();
      fetchAppointments();
    } catch (err) {
      setDialogError(err.message || 'Failed to create appointment');
    }
  };

  const handleDeleteAppointment = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await appointments.delete(id);
        fetchAppointments();
      } catch (err) {
        setError('Failed to delete appointment');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Scheduled':
        return 'primary';
      case 'Completed':
        return 'success';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Appointments
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          New Appointment
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Typography>Loading appointments...</Typography>
      ) : (
        <Grid container spacing={3}>
          {appointmentList.length === 0 ? (
            <Grid item xs={12}>
              <Typography>No appointments found.</Typography>
            </Grid>
          ) : (
            appointmentList.map((appointment) => (
              <Grid item xs={12} md={6} lg={4} key={appointment.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" component="div">
                        {appointment.client_name}
                      </Typography>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteAppointment(appointment.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    <Typography color="text.secondary" gutterBottom>
                      {format(new Date(appointment.scheduled_for), 'PPP p')}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {appointment.reason || 'No reason provided'}
                    </Typography>
                    <Chip
                      label={appointment.status}
                      color={getStatusColor(appointment.status)}
                      size="small"
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Appointment</DialogTitle>
        <DialogContent>
          {dialogError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {dialogError}
            </Alert>
          )}
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="client-label">Client</InputLabel>
              <Select
                labelId="client-label"
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
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
              label="Date and Time"
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Reason"
              multiline
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleCreateAppointment} variant="contained" color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Appointments; 