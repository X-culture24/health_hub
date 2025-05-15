import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { prescriptions, clients } from '../../services/api';
import { format } from 'date-fns';

const Prescriptions = () => {
  const navigate = useNavigate();
  const [prescriptionList, setPrescriptionList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [clientList, setClientList] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [dialogError, setDialogError] = useState(null);

  useEffect(() => {
    fetchPrescriptions();
    fetchClients();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await prescriptions.list();
      setPrescriptionList(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch prescriptions. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await clients.list();
      setClientList(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Failed to fetch clients:', err);
      setClientList([]);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedClient('');
    setMedicationName('');
    setDosage('');
    setFrequency('');
    setStartDate('');
    setEndDate('');
    setNotes('');
    setDialogError(null);
  };

  const handleCreatePrescription = async () => {
    if (!selectedClient || !medicationName || !dosage || !frequency || !startDate) {
      setDialogError('Please fill in all required fields');
      return;
    }

    try {
      const prescriptionData = {
        client_id: selectedClient,
        medication_name: medicationName,
        dosage: dosage,
        frequency: frequency,
        start_date: startDate,
        end_date: endDate || null,
        notes: notes
      };

      await prescriptions.create(prescriptionData);
      handleCloseDialog();
      fetchPrescriptions();
    } catch (err) {
      setDialogError(err.message || 'Failed to create prescription');
    }
  };

  const handleDeletePrescription = async (id) => {
    if (window.confirm('Are you sure you want to delete this prescription?')) {
      try {
        await prescriptions.delete(id);
        fetchPrescriptions();
      } catch (err) {
        setError('Failed to delete prescription');
      }
    }
  };

  const handleViewPrescription = (id) => {
    navigate(`/prescriptions/${id}`);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Prescriptions
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          New Prescription
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Typography>Loading prescriptions...</Typography>
      ) : (
        <Grid container spacing={3}>
          {prescriptionList.length === 0 ? (
            <Grid item xs={12}>
              <Typography>No prescriptions found.</Typography>
            </Grid>
          ) : (
            prescriptionList.map((prescription) => (
              <Grid item xs={12} md={6} lg={4} key={prescription.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: 6,
                    }
                  }}
                  onClick={() => handleViewPrescription(prescription.id)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" component="div">
                        {prescription.client?.first_name && prescription.client?.last_name
                          ? `${prescription.client.first_name} ${prescription.client.last_name}`
                          : prescription.client_name || 'Unknown Client'}
                      </Typography>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePrescription(prescription.id);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    <Typography variant="subtitle1" color="primary" gutterBottom>
                      {prescription.medication_name}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Dosage:</strong> {prescription.dosage}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Frequency:</strong> {prescription.frequency}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Start Date:</strong> {format(new Date(prescription.start_date), 'PPP')}
                    </Typography>
                    {prescription.end_date && (
                      <Typography variant="body2" gutterBottom>
                        <strong>End Date:</strong> {format(new Date(prescription.end_date), 'PPP')}
                      </Typography>
                    )}
                    {prescription.notes && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>Notes:</strong> {prescription.notes}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Prescription</DialogTitle>
        <DialogContent>
          {dialogError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {dialogError}
            </Alert>
          )}
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="client-label">Client</InputLabel>
              <Select
                labelId="client-label"
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                label="Client"
                required
              >
                {clientList.map((client) => (
                  <MenuItem key={client.id} value={client.id}>
                    {client.first_name} {client.last_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Medication Name"
              value={medicationName}
              onChange={(e) => setMedicationName(e.target.value)}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Dosage"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="End Date (Optional)"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleCreatePrescription} variant="contained" color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Prescriptions; 