import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  CircularProgress,
  Chip
} from '@mui/material';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call
    setAppointments([
      {
        id: 1,
        client_name: 'John Doe',
        scheduled_for: '2025-04-28T10:00:00',
        reason: 'Regular Checkup',
        status: 'Scheduled',
        doctor: 'Dr. Smith'
      },
      {
        id: 2,
        client_name: 'Jane Smith',
        scheduled_for: '2025-04-28T11:00:00',
        reason: 'Follow-up',
        status: 'Confirmed',
        doctor: 'Dr. Johnson'
      }
    ]);
    setLoading(false);
  }, []);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'primary';
      case 'confirmed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
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
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Appointments
        </Typography>
        <Button variant="contained" color="primary">
          Schedule New Appointment
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Client</TableCell>
              <TableCell>Date & Time</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Doctor</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>{appointment.client_name}</TableCell>
                <TableCell>
                  {new Date(appointment.scheduled_for).toLocaleString()}
                </TableCell>
                <TableCell>{appointment.reason}</TableCell>
                <TableCell>{appointment.doctor}</TableCell>
                <TableCell>
                  <Chip 
                    label={appointment.status}
                    color={getStatusColor(appointment.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Button color="primary" size="small">View</Button>
                  <Button color="secondary" size="small">Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default AppointmentList; 