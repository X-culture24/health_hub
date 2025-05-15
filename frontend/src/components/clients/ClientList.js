import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Visibility, PersonAdd } from '@mui/icons-material';
import { clients } from '../../services/api';

const ClientList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [clientList, setClientList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await clients.list();
      setClientList(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.length < 2) {
      setError('Please enter at least 2 characters to search');
      return;
    }

    try {
      setLoading(true);
      const response = await clients.search(searchQuery);
      setClientList(response.data);
      setError('');
    } catch (err) {
      setError('Failed to search clients');
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (clientId) => {
    navigate(`/clients/${clientId}`);
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Clients</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAdd />}
            onClick={() => navigate('/clients/register')}
          >
            Register New Client
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            fullWidth
            label="Search Clients"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button variant="contained" onClick={handleSearch}>
            Search
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List>
            {clientList.map((client) => (
              <ListItem key={client.id} divider>
                <ListItemText
                  primary={`${client.first_name} ${client.last_name}`}
                  secondary={client.email}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="view"
                    onClick={() => handleViewProfile(client.id)}
                  >
                    <Visibility />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
            {clientList.length === 0 && (
              <Typography variant="body2" sx={{ textAlign: 'center', p: 2 }}>
                No clients found
              </Typography>
            )}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default ClientList; 