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
  Alert
} from '@mui/material';
import { programs } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const ProgramList = () => {
  const [programsList, setProgramsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPrograms = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await programs.list();
        setProgramsList(response.data || []);
      } catch (err) {
        setError('Failed to load programs');
      } finally {
        setLoading(false);
      }
    };
    fetchPrograms();
  }, []);

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
          Health Programs
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/programs/create')}>
          Add New Program
        </Button>
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {programsList.length > 0 ? programsList.map((program) => (
              <TableRow key={program.id}>
                <TableCell>{program.name}</TableCell>
                <TableCell>{program.description}</TableCell>
                <TableCell>{program.created_at ? new Date(program.created_at).toLocaleDateString() : ''}</TableCell>
                <TableCell>
                  <Button color="primary" size="small" onClick={() => navigate(`/programs/${program.id}`)}>View</Button>
                  <Button color="secondary" size="small" onClick={() => navigate(`/programs/${program.id}/edit`)}>Edit</Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} align="center">No programs found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ProgramList; 