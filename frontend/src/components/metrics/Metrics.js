import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { metrics } from '../../services/api';

const Metrics = () => {
  const navigate = useNavigate();
  const [metricsList, setMetricsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMetrics();
  }, [page, rowsPerPage, searchQuery]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await metrics.list();
      setMetricsList(response.data);
    } catch (error) {
      setError('Failed to load metrics. Please try again.');
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this metric?')) {
      try {
        await metrics.delete(id);
        fetchMetrics();
      } catch (error) {
        setError('Failed to delete metric. Please try again.');
        console.error('Error deleting metric:', error);
      }
    }
  };

  const filteredMetrics = metricsList.filter(metric => 
    (metric.client_name && metric.client_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (metric.name && metric.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const paginatedMetrics = filteredMetrics.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Health Metrics
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            sx={{ flexGrow: 1 }}
            variant="outlined"
            placeholder="Search metrics..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/metrics/record')}
          >
            Record New Metric
          </Button>
        </Box>
      </Box>

      {error && (
        <Box sx={{ mb: 2 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Client</TableCell>
              <TableCell>Metric Name</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Recorded By</TableCell>
              <TableCell>Recorded At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedMetrics.map((metric) => (
              <TableRow key={metric.id}>
                <TableCell>{metric.client || metric.client_name}</TableCell>
                <TableCell>{metric.name}</TableCell>
                <TableCell>{metric.value}</TableCell>
                <TableCell>{metric.unit || '-'}</TableCell>
                <TableCell>{metric.recorded_by}</TableCell>
                <TableCell>{new Date(metric.recorded_at).toLocaleString()}</TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton 
                      size="small" 
                      onClick={() => navigate(`/metrics/${metric.id}/edit`)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDelete(metric.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredMetrics.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Container>
  );
};

export default Metrics; 