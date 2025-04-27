import React, { useEffect, useState } from 'react';
import { Container, Paper, Typography, Box, CircularProgress, Alert, List, ListItem, ListItemText, Divider } from '@mui/material';
import { clients } from '../services/api';
import axios from 'axios';

const UserProfile = () => {
  const [comprehensive, setComprehensive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [staffProfile, setStaffProfile] = useState(null);

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const clientId = user?.id;

  useEffect(() => {
    if (!user) {
      setError('No user found. Please log in.');
      setLoading(false);
      return;
    }
    if (user.is_doctor || user.is_nurse) {
      // Fetch staff profile from /api/auth/user/
      const fetchStaffProfile = async () => {
        setLoading(true);
        setError('');
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get('http://localhost:8000/api/auth/user/', {
            headers: { Authorization: `Token ${token}` }
          });
          setStaffProfile(response.data);
        } catch (err) {
          setError('Failed to load staff profile');
        } finally {
          setLoading(false);
        }
      };
      fetchStaffProfile();
      return;
    }
    // Otherwise, fetch client profile
    const fetchComprehensive = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await clients.getComprehensiveInfo(clientId);
        setComprehensive(response.data);
      } catch (err) {
        setError('Failed to load client profile');
      } finally {
        setLoading(false);
      }
    };
    fetchComprehensive();
  }, [clientId, user]);

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;
  if (error) return <Container maxWidth="sm"><Alert severity="error" sx={{ mt: 4 }}>{error}</Alert></Container>;

  // Staff profile view
  if (staffProfile) {
    return (
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
          <Typography variant="h5" gutterBottom>Staff Profile</Typography>
          <List>
            <ListItem><ListItemText primary="Username" secondary={staffProfile.username} /></ListItem>
            <Divider component="li" />
            <ListItem><ListItemText primary="Work Email" secondary={staffProfile.work_email} /></ListItem>
            <Divider component="li" />
            <ListItem><ListItemText primary="Employer ID" secondary={staffProfile.employer_id} /></ListItem>
            <Divider component="li" />
            <ListItem><ListItemText primary="First Name" secondary={staffProfile.first_name} /></ListItem>
            <Divider component="li" />
            <ListItem><ListItemText primary="Last Name" secondary={staffProfile.last_name} /></ListItem>
            <Divider component="li" />
            <ListItem><ListItemText primary="Role" secondary={staffProfile.is_doctor ? 'Doctor' : staffProfile.is_nurse ? 'Nurse' : 'Other'} /></ListItem>
          </List>
        </Paper>
      </Container>
    );
  }

  // Client profile view
  if (!comprehensive) return null;
  const { client, enrollments, prescriptions, appointments } = comprehensive;

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom>Client Profile</Typography>
        <List>
          <ListItem><ListItemText primary="Name" secondary={`${client.first_name} ${client.last_name}`} /></ListItem>
          <Divider component="li" />
          <ListItem><ListItemText primary="Email" secondary={client.email} /></ListItem>
          <Divider component="li" />
          <ListItem><ListItemText primary="Phone" secondary={client.phone} /></ListItem>
          <Divider component="li" />
          <ListItem><ListItemText primary="Date of Birth" secondary={client.date_of_birth} /></ListItem>
          <Divider component="li" />
          <ListItem><ListItemText primary="Address" secondary={client.address} /></ListItem>
          <Divider component="li" />
          <ListItem><ListItemText primary="Emergency Contact" secondary={client.emergency_contact} /></ListItem>
        </List>
        <Box mt={4}>
          <Typography variant="h6">Enrollments</Typography>
          <List>
            {enrollments && enrollments.length > 0 ? enrollments.map(enrollment => (
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
            {prescriptions && prescriptions.length > 0 ? prescriptions.map(prescription => (
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
            {appointments && appointments.length > 0 ? appointments.map(appointment => (
              <ListItem key={appointment.id}>
                <ListItemText
                  primary={`With: ${appointment.scheduled_with || 'N/A'}`}
                  secondary={`On: ${new Date(appointment.scheduled_for).toLocaleString()} | Status: ${appointment.status}`}
                />
              </ListItem>
            )) : <ListItem><ListItemText primary="No appointments found." /></ListItem>}
          </List>
        </Box>
      </Paper>
    </Container>
  );
};

export default UserProfile; 