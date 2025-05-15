import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Button,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { clientAPI } from '../services/api';

const ClientSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const searchClients = async () => {
      if (searchQuery.length < 2) {
        setClients([]);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await clientAPI.search(searchQuery);
        setClients(response.data);
      } catch (error) {
        setError('Failed to search clients');
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchClients, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleClientClick = (clientId) => {
    navigate(`/clients/${clientId}`);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" component="h1" gutterBottom align="center">
            Search Clients
          </Typography>

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {error && (
            <Typography color="error" align="center">
              {error}
            </Typography>
          )}

          {loading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {clients.map((client, index) => (
                <React.Fragment key={client.id}>
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => handleClientClick(client.id)}>
                      <ListItemText
                        primary={`${client.first_name} ${client.last_name}`}
                        secondary={`ID: ${client.id} | DOB: ${new Date(client.date_of_birth).toLocaleDateString()}`}
                      />
                    </ListItemButton>
                  </ListItem>
                  {index < clients.length - 1 && <Divider />}
                </React.Fragment>
              ))}
              {clients.length === 0 && searchQuery.length >= 2 && (
                <Typography align="center" color="textSecondary">
                  No clients found
                </Typography>
              )}
            </List>
          )}

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/clients')}
            >
              Back to Clients
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate('/clients/register')}
            >
              Register New Client
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ClientSearch; 