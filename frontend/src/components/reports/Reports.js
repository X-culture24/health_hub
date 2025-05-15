import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const Reports = () => {
  const [reportType, setReportType] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleGenerateReport = () => {
    // TODO: Implement report generation
    console.log('Generating report:', { reportType, startDate, endDate });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Reports
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportType}
                label="Report Type"
                onChange={(e) => setReportType(e.target.value)}
              >
                <MenuItem value="client_attendance">Client Attendance</MenuItem>
                <MenuItem value="program_enrollment">Program Enrollment</MenuItem>
                <MenuItem value="prescription_usage">Prescription Usage</MenuItem>
                <MenuItem value="revenue_analysis">Revenue Analysis</MenuItem>
                <MenuItem value="staff_performance">Staff Performance</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} md={4}>
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
            <Box display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                color="primary"
                onClick={handleGenerateReport}
                disabled={!reportType || !startDate || !endDate}
              >
                Generate Report
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Report Preview Section */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Report Preview
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Select a report type and date range to generate a report.
        </Typography>
      </Paper>
    </Container>
  );
};

export default Reports; 