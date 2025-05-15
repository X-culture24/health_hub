import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, Box, CircularProgress, Alert, TextField, Button } from '@mui/material';
import { programs } from '../../services/api';

const ProgramEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProgram(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await programs.update(id, program);
      setSuccess('Program updated successfully!');
      setTimeout(() => navigate(`/programs/${id}`), 1000);
    } catch (err) {
      setError('Failed to update program');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;
  if (error) return <Container maxWidth="sm"><Alert severity="error" sx={{ mt: 4 }}>{error}</Alert></Container>;

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom>Edit Program</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Name"
            name="name"
            value={program.name}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="Description"
            name="description"
            value={program.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
            required
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
            <Button variant="outlined" onClick={() => navigate(-1)} disabled={loading}>
              Cancel
            </Button>
          </Box>
          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
        </form>
      </Paper>
    </Container>
  );
};

export default ProgramEdit; 