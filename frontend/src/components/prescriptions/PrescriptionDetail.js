import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import { prescriptions } from '../../services/api';

const PrescriptionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchPrescription();
  }, [id]);

  const fetchPrescription = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await prescriptions.get(id);
      setPrescription(data);
    } catch (err) {
      setError('Failed to fetch prescription details. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleteLoading(true);
      await prescriptions.delete(id);
      navigate('/prescriptions');
    } catch (err) {
      setError('Failed to delete prescription. Please try again.');
      console.error(err);
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!prescription) {
    return (
      <Alert severity="info">
        Prescription not found.
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Prescription Details
        </Typography>
        <Box>
          <Button
            variant="outlined"
            onClick={() => navigate('/prescriptions')}
            sx={{ mr: 1 }}
          >
            Back to List
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteClick}
          >
            Delete Prescription
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Client Information
            </Typography>
            <Typography>
              Name: {prescription.client.first_name} {prescription.client.last_name}
            </Typography>
            <Typography>
              ID: {prescription.client.id}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Prescription Information
            </Typography>
            <Typography>
              Medication: {prescription.medication_name}
            </Typography>
            <Typography>
              Dosage: {prescription.dosage}
            </Typography>
            <Typography>
              Frequency: {prescription.frequency}
            </Typography>
            <Typography>
              Start Date: {new Date(prescription.start_date).toLocaleDateString()}
            </Typography>
            {prescription.end_date && (
              <Typography>
                End Date: {new Date(prescription.end_date).toLocaleDateString()}
              </Typography>
            )}
          </Grid>

          {prescription.notes && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Notes
              </Typography>
              <Typography>
                {prescription.notes}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Prescription</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this prescription? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PrescriptionDetail; 