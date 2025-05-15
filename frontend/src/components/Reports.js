import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  CircularProgress,
  Alert,
  TextField,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import reportAPI from '../services/reportAPI';

const Reports = () => {
  const [reportType, setReportType] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reportData, setReportData] = useState(null);

  const reportTypes = [
    { value: 'program_enrollment', label: 'Program Enrollment' },
    // Add more report types here as needed
  ];

  const handleGenerateReport = async () => {
    if (!reportType || !startDate || !endDate) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setReportData(null);

    try {
      const response = await reportAPI.generateReport({
        type: reportType,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      });
      setReportData(response);
      setSuccess('Report generated successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (format = 'pdf') => {
    if (!reportData?.id) {
      setError('No report available to download');
      return;
    }

    try {
      const response = await reportAPI.downloadReport(reportData.id, format);
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${reportType}-${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download report');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Reports
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Generate Reports
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportType}
                label="Report Type"
                onChange={(e) => setReportType(e.target.value)}
              >
                {reportTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} md={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={setEndDate}
                renderInput={(params) => <TextField {...params} fullWidth />}
                minDate={startDate}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleGenerateReport}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Generate Report'}
          </Button>
          {reportData && (
            <Button
              variant="outlined"
              onClick={() => handleDownloadReport('pdf')}
              disabled={loading}
            >
              Download PDF
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}

        {reportData && (
          <Paper sx={{ mt: 3, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Report Results
            </Typography>
            {reportType === 'program_enrollment' && (
              <Box>
                <Typography variant="body1">
                  Total Enrollments: {reportData.total_enrollments}
                </Typography>
                <Typography variant="body1">
                  Active Enrollments: {reportData.active_enrollments}
                </Typography>
                <Typography variant="body1">
                  Completed Enrollments: {reportData.completed_enrollments}
                </Typography>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Program Breakdown:
                </Typography>
                {reportData.program_breakdown.map((program, index) => (
                  <Box key={index} sx={{ ml: 2, mb: 1 }}>
                    <Typography variant="body1">
                      {program.program}:
                    </Typography>
                    <Typography variant="body2" sx={{ ml: 2 }}>
                      Total: {program.total}
                    </Typography>
                    <Typography variant="body2" sx={{ ml: 2 }}>
                      Active: {program.active}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        )}
      </Paper>
    </Container>
  );
};

export default Reports; 