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
import { reports } from '../../services/api';

const Reports = () => {
  const [reportType, setReportType] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [reportError, setReportError] = useState('');
  const [reportLoading, setReportLoading] = useState(false);

  const handleGenerateReport = async () => {
    setReportError('');
    setReportData(null);
    setReportLoading(true);
    try {
      const params = {
        type: reportType,
        start_date: startDate?.toISOString().slice(0, 10),
        end_date: endDate?.toISOString().slice(0, 10),
      };
      const response = await reports.generate(params);
      setReportData(response.data);
    } catch (err) {
      setReportError('Failed to generate report');
    } finally {
      setReportLoading(false);
    }
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
                disabled={!reportType || !startDate || !endDate || reportLoading}
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
        {reportLoading && <Typography>Loading...</Typography>}
        {reportError && <Typography color="error">{reportError}</Typography>}
        {reportData ? (
          typeof reportData === 'object' && reportData !== null && !Array.isArray(reportData) ? (
            Object.entries(reportData).map(([key, value]) => (
              <div key={key} style={{ marginBottom: 8 }}>
                <strong>{key}:</strong>{' '}
                {Array.isArray(value) ? (
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {Array.isArray(value) ? value.map((item, idx) => (
                      <li key={idx}>{typeof item === 'object' ? JSON.stringify(item) : String(item)}</li>
                    )) : null}
                  </ul>
                ) : (
                  <span>{' '}{String(value)}</span>
                )}
              </div>
            ))
          ) : Array.isArray(reportData) ? (
            <ul>
              {reportData.map((item, idx) => (
                <li key={idx}>{typeof item === 'object' ? JSON.stringify(item) : String(item)}</li>
              ))}
            </ul>
          ) : (
            <span>{String(reportData)}</span>
          )
        ) : !reportLoading && !reportError && (
          <Typography variant="body1" color="textSecondary">
            Select a report type and date range to generate a report.
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default Reports; 