import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

function Reports() {
  const [reportType, setReportType] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const reportTypes = [
    'Client Attendance',
    'Program Enrollment',
    'Prescription Usage',
    'Appointment Statistics',
    'Revenue Analysis',
    'Staff Performance',
    'Client Progress',
    'Program Effectiveness',
    'Medication Compliance',
    'Resource Utilization',
  ];

  // Sample report data
  const sampleReportData = [
    { id: 1, metric: 'Total Clients', value: '245', change: '+12%' },
    { id: 2, metric: 'Active Programs', value: '18', change: '+3' },
    { id: 3, metric: 'Appointments', value: '156', change: '+24%' },
    { id: 4, metric: 'Prescriptions', value: '89', change: '+8%' },
    { id: 5, metric: 'Revenue', value: '$45,678', change: '+15%' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reports
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  label="Report Type"
                >
                  {reportTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" color="primary">
                Generate Report
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {sampleReportData.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {item.metric}
                </Typography>
                <Typography variant="h4" component="div" gutterBottom>
                  {item.value}
                </Typography>
                <Typography
                  variant="body2"
                  color={item.change.startsWith('+') ? 'success.main' : 'error.main'}
                >
                  {item.change} from last period
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Detailed Report
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Metric</TableCell>
                  <TableCell>Current Period</TableCell>
                  <TableCell>Previous Period</TableCell>
                  <TableCell>Change</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sampleReportData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.metric}</TableCell>
                    <TableCell>{item.value}</TableCell>
                    <TableCell>
                      {item.metric === 'Revenue'
                        ? '$39,720'
                        : item.metric === 'Appointments'
                        ? '126'
                        : item.metric === 'Prescriptions'
                        ? '82'
                        : item.metric === 'Active Programs'
                        ? '15'
                        : '219'}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: item.change.startsWith('+')
                          ? 'success.main'
                          : 'error.main',
                      }}
                    >
                      {item.change}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Reports; 