import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Grid,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ClientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [programs, setPrograms] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const [clientResponse, programsResponse, appointmentsResponse] = await Promise.all([
          axios.get(`http://localhost:8000/api/clients/${id}/`),
          axios.get(`http://localhost:8000/api/clients/${id}/programs/`),
          axios.get(`http://localhost:8000/api/clients/${id}/appointments/`)
        ]);

        setClient(clientResponse.data);
        setPrograms(programsResponse.data);
        setAppointments(appointmentsResponse.data);
      } catch (error) {
        console.error('Error fetching client data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!client) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h5">Client not found</Typography>
        <Button variant="contained" onClick={() => navigate('/clients')} sx={{ mt: 2 }}>
          Back to Clients
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button variant="outlined" onClick={() => navigate('/clients')} sx={{ mb: 2 }}>
          Back to Clients
        </Button>
        <Typography variant="h4" gutterBottom>
          Client Profile
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Personal Information</Typography>
              <Typography><strong>Name:</strong> {`${client.first_name} ${client.last_name}`}</Typography>
              <Typography><strong>Email:</strong> {client.email}</Typography>
              <Typography><strong>Phone:</strong> {client.phone}</Typography>
              <Typography><strong>Status:</strong> {client.status}</Typography>
              <Typography><strong>Date of Birth:</strong> {client.date_of_birth}</Typography>
              <Typography><strong>Address:</strong> {client.address}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ width: '100%' }}>
            <Tabs value={activeTab} onChange={handleTabChange} centered>
              <Tab label="Programs" />
              <Tab label="Appointments" />
              <Tab label="Medical History" />
            </Tabs>

            <Box sx={{ p: 3 }}>
              {activeTab === 0 && (
                <List>
                  {programs.map((program) => (
                    <React.Fragment key={program.id}>
                      <ListItem>
                        <ListItemText
                          primary={program.name}
                          secondary={`Status: ${program.status} | Start Date: ${program.start_date}`}
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              )}

              {activeTab === 1 && (
                <List>
                  {appointments.map((appointment) => (
                    <React.Fragment key={appointment.id}>
                      <ListItem>
                        <ListItemText
                          primary={`${appointment.type} - ${appointment.date}`}
                          secondary={`Status: ${appointment.status} | Provider: ${appointment.provider_name}`}
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              )}

              {activeTab === 2 && (
                <Typography variant="body1">
                  Medical history information will be implemented in the next phase.
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ClientProfile; 