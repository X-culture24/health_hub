import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  IconButton,
  CircularProgress,
  Tooltip,
  Alert
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

const EncounterList = () => {
  const navigate = useNavigate();
  const [encounters, setEncounters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEncounters();
  }, []);

  const fetchEncounters = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/encounters/', {
        headers: { Authorization: `Token ${token}` }
      });
      setEncounters(response.data);
    } catch (err) {
      setError('Failed to fetch encounters.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this encounter?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:8000/api/encounters/${id}/delete/`, {
          headers: { Authorization: `Token ${token}` }
        });
        fetchEncounters();
      } catch (err) {
        setError('Failed to delete encounter.');
      }
    }
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Encounters</Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/encounters/create')}>Create Encounter</Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Client</TableCell>
              <TableCell>Provider</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Date/Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {encounters.map((encounter) => (
              <TableRow key={encounter.id}>
                <TableCell>{encounter.client}</TableCell>
                <TableCell>{encounter.provider}</TableCell>
                <TableCell>{encounter.encounter_type}</TableCell>
                <TableCell>{new Date(encounter.scheduled_for).toLocaleString()}</TableCell>
                <TableCell>{encounter.status}</TableCell>
                <TableCell>{encounter.notes}</TableCell>
                <TableCell>
                  <Tooltip title="Delete">
                    <IconButton color="error" onClick={() => handleDelete(encounter.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default EncounterList; 