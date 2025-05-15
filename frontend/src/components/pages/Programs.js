import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';

// Sample program types
const programTypes = [
  'Weight Management',
  'Diabetes Management',
  'Cardiac Rehabilitation',
  'Mental Health Support',
  'Nutrition Counseling',
  'Physical Therapy',
  'Smoking Cessation',
  'Chronic Pain Management',
  'Stress Management',
  'Sleep Improvement',
];

// Sample program durations
const programDurations = [
  '4 weeks',
  '8 weeks',
  '12 weeks',
  '16 weeks',
  '6 months',
  '1 year',
];

// Sample program frequencies
const programFrequencies = [
  'Daily',
  'Weekly',
  'Bi-weekly',
  'Monthly',
  'Quarterly',
];

function Programs() {
  const [programs, setPrograms] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    duration: '',
    frequency: '',
    cost: '',
    max_participants: '',
  });

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/programs/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPrograms(response.data);
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      name: '',
      type: '',
      description: '',
      duration: '',
      frequency: '',
      cost: '',
      max_participants: '',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:8000/api/programs/create/',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPrograms();
      handleCloseDialog();
    } catch (error) {
      console.error('Error creating program:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Health Programs
      </Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container justifyContent="flex-end">
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
            >
              Add New Program
            </Button>
          </Grid>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Program Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Frequency</TableCell>
              <TableCell>Cost</TableCell>
              <TableCell>Max Participants</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {programs.map((program) => (
              <TableRow key={program.id}>
                <TableCell>{program.name}</TableCell>
                <TableCell>{program.type}</TableCell>
                <TableCell>{program.duration}</TableCell>
                <TableCell>{program.frequency}</TableCell>
                <TableCell>${program.cost}</TableCell>
                <TableCell>{program.max_participants}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Program</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Program Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  options={programTypes}
                  value={formData.type}
                  onChange={(event, newValue) => {
                    setFormData({ ...formData, type: newValue });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Program Type"
                      required
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Duration</InputLabel>
                  <Select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    required
                  >
                    {programDurations.map((duration) => (
                      <MenuItem key={duration} value={duration}>
                        {duration}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Frequency</InputLabel>
                  <Select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    required
                  >
                    {programFrequencies.map((frequency) => (
                      <MenuItem key={frequency} value={frequency}>
                        {frequency}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Cost"
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Max Participants"
                  type="number"
                  value={formData.max_participants}
                  onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              Add Program
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default Programs; 