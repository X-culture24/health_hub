import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Paper, Typography, Box, CircularProgress, Alert, List, ListItem, ListItemText, Divider } from '@mui/material';
import { programs } from '../../services/api';

const ProgramView = () => {
  const { id } = useParams();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProgram = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await programs.getById(id);
        setProgram(response.data);
      } catch (err) {
        setError('Failed to load program details');
      } finally {
        setLoading(false);
      }
    };
    fetchProgram();
  }, [id]);

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;
  if (error) return <Container maxWidth="sm"><Alert severity="error" sx={{ mt: 4 }}>{error}</Alert></Container>;
  if (!program) return null;

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom>Program Details</Typography>
        <List>
          <ListItem><ListItemText primary="Name" secondary={program.name} /></ListItem>
          <Divider component="li" />
          <ListItem><ListItemText primary="Description" secondary={program.description} /></ListItem>
          <Divider component="li" />
          <ListItem><ListItemText primary="Created At" secondary={program.created_at ? new Date(program.created_at).toLocaleDateString() : ''} /></ListItem>
        </List>
      </Paper>
    </Container>
  );
};

export default ProgramView; 