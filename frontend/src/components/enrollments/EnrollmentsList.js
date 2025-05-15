import React, { useEffect, useState } from 'react';
import { enrollments } from '../../services/api';
import { Container, Typography, Paper, List, ListItem, ListItemText, CircularProgress, Alert } from '@mui/material';

const EnrollmentsList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEnrollments = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await enrollments.list();
        setData(response.data || []);
      } catch (err) {
        setError('Failed to load enrollments');
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom>All Enrollments</Typography>
        <List>
          {data.length > 0 ? data.map(enrollment => (
            <ListItem key={enrollment.id}>
              <ListItemText
                primary={`Client: ${enrollment.client} | Program: ${enrollment.program}`}
                secondary={`Enrolled by: ${enrollment.enrolled_by || 'N/A'} on ${new Date(enrollment.enrollment_date).toLocaleDateString()}`}
              />
            </ListItem>
          )) : <ListItem><ListItemText primary="No enrollments found." /></ListItem>}
        </List>
      </Paper>
    </Container>
  );
};

export default EnrollmentsList; 