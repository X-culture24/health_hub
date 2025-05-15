import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Grid,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Person as PersonIcon,
  LocalHospital as ProgramsIcon,
  LocalPharmacy as PrescriptionsIcon,
  Timeline as MetricsIcon,
  Event as AppointmentsIcon,
} from '@mui/icons-material';
import axios from 'axios';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function ClientProfile() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientData();
  }, [id]);

  const fetchClientData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8000/api/clients/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClient(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching client data:', error);
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (!client) {
    return <Typography>Client not found</Typography>;
  }

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Typography variant="h4" gutterBottom>
                {`${client.first_name} ${client.last_name}`}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Date of Birth: {new Date(client.date_of_birth).toLocaleDateString()}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Gender: {client.gender}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Phone: {client.phone_number}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Email: {client.email}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Address: {client.address}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant="contained"
                fullWidth
                sx={{ mb: 2 }}
                onClick={() => {/* Implement edit client */}}
              >
                Edit Profile
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {/* Implement add appointment */}}
              >
                Schedule Appointment
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab icon={<PersonIcon />} label="Profile" />
        <Tab icon={<ProgramsIcon />} label="Programs" />
        <Tab icon={<PrescriptionsIcon />} label="Prescriptions" />
        <Tab icon={<MetricsIcon />} label="Metrics" />
        <Tab icon={<AppointmentsIcon />} label="Appointments" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">First Name</Typography>
                <Typography variant="body1">{client.first_name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Last Name</Typography>
                <Typography variant="body1">{client.last_name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Date of Birth</Typography>
                <Typography variant="body1">
                  {new Date(client.date_of_birth).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Gender</Typography>
                <Typography variant="body1">{client.gender}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Health Programs
            </Typography>
            <List>
              {client.enrollments.map((enrollment) => (
                <React.Fragment key={enrollment.program}>
                  <ListItem>
                    <ListItemText
                      primary={enrollment.program}
                      secondary={`Enrolled on: ${new Date(enrollment.enrollment_date).toLocaleDateString()}`}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Prescriptions
            </Typography>
            <List>
              {client.prescriptions.map((prescription) => (
                <React.Fragment key={prescription.id}>
                  <ListItem>
                    <ListItemText
                      primary={prescription.medication_name}
                      secondary={
                        <>
                          <Typography component="span" variant="body2">
                            {`Dosage: ${prescription.dosage} | Frequency: ${prescription.frequency}`}
                          </Typography>
                          <br />
                          <Typography component="span" variant="body2">
                            {`Start Date: ${new Date(prescription.start_date).toLocaleDateString()}`}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Health Metrics
            </Typography>
            <List>
              {client.metrics.map((metric) => (
                <React.Fragment key={metric.id}>
                  <ListItem>
                    <ListItemText
                      primary={`${metric.name}: ${metric.value}${metric.unit}`}
                      secondary={`Recorded on: ${new Date(metric.recorded_at).toLocaleDateString()}`}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Appointments
            </Typography>
            <List>
              {client.appointments.map((appointment) => (
                <React.Fragment key={appointment.id}>
                  <ListItem>
                    <ListItemText
                      primary={`Scheduled with: ${appointment.scheduled_with}`}
                      secondary={
                        <>
                          <Typography component="span" variant="body2">
                            {`Date: ${new Date(appointment.scheduled_for).toLocaleString()}`}
                          </Typography>
                          <br />
                          <Typography component="span" variant="body2">
                            {`Status: ${appointment.status}`}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      </TabPanel>
    </Box>
  );
}

export default ClientProfile; 