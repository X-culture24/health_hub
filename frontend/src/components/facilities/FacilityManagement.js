import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { facilities } from '../../services/api';
import toast from 'react-hot-toast';

const FacilityManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialog, setDeleteDialog] = useState({ open: false, facility: null });
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: facilitiesData, isLoading, error } = useQuery(
    'facilities',
    facilities.list,
    {
      onError: (error) => {
        toast.error('Failed to load facilities');
        console.error('Error loading facilities:', error);
      }
    }
  );

  const deleteMutation = useMutation(facilities.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('facilities');
      toast.success('Facility deleted successfully');
      setDeleteDialog({ open: false, facility: null });
    },
    onError: (error) => {
      toast.error('Failed to delete facility');
      console.error('Delete error:', error);
    }
  });

  const handleDelete = (facility) => {
    setDeleteDialog({ open: true, facility });
  };

  const confirmDelete = () => {
    if (deleteDialog.facility) {
      deleteMutation.mutate(deleteDialog.facility.id);
    }
  };

  const getFacilityTypeColor = (type) => {
    const colors = {
      'national_hospital': 'error',
      'county_hospital': 'warning',
      'sub_county_hospital': 'info',
      'district_hospital': 'primary',
      'health_center': 'success',
      'dispensary': 'secondary',
      'clinic': 'default',
    };
    return colors[type] || 'default';
  };

  const getFacilityLevelColor = (level) => {
    const colors = {
      'level_6': 'error',
      'level_5': 'warning',
      'level_4': 'info',
      'level_3': 'primary',
      'level_2': 'success',
      'level_1': 'secondary',
    };
    return colors[level] || 'default';
  };

  const filteredFacilities = facilitiesData?.filter(facility => {
    const matchesType = filterType === 'all' || facility.facility_type === filterType;
    const matchesSearch = facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         facility.county.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  }) || [];

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading facilities...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="error">Error loading facilities</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Health Facilities Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/facilities/create')}
        >
          Add New Facility
        </Button>
      </Box>

      {/* Filters */}
      <Box display="flex" gap={2} mb={3}>
        <TextField
          label="Search facilities"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 300 }}
        />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Type</InputLabel>
          <Select
            value={filterType}
            label="Filter by Type"
            onChange={(e) => setFilterType(e.target.value)}
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="national_hospital">National Hospital</MenuItem>
            <MenuItem value="county_hospital">County Hospital</MenuItem>
            <MenuItem value="sub_county_hospital">Sub-County Hospital</MenuItem>
            <MenuItem value="district_hospital">District Hospital</MenuItem>
            <MenuItem value="health_center">Health Center</MenuItem>
            <MenuItem value="dispensary">Dispensary</MenuItem>
            <MenuItem value="clinic">Private Clinic</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Facilities Grid */}
      <Grid container spacing={3}>
        {filteredFacilities.map((facility) => (
          <Grid item xs={12} md={6} lg={4} key={facility.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="between" alignItems="flex-start" mb={2}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {facility.name}
                  </Typography>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/facilities/${facility.id}/edit`)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(facility)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Box display="flex" gap={1} mb={2}>
                  <Chip
                    label={facility.facility_type?.replace('_', ' ').toUpperCase()}
                    color={getFacilityTypeColor(facility.facility_type)}
                    size="small"
                  />
                  <Chip
                    label={facility.level?.replace('_', ' ').toUpperCase()}
                    color={getFacilityLevelColor(facility.level)}
                    size="small"
                  />
                  <Chip
                    label={facility.is_active ? 'Active' : 'Inactive'}
                    color={facility.is_active ? 'success' : 'error'}
                    size="small"
                  />
                </Box>

                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <LocationIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {facility.county}, {facility.sub_county}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <PhoneIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {facility.phone_number}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <EmailIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {facility.email}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <BusinessIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Capacity: {facility.bed_capacity} beds
                  </Typography>
                </Box>

                {facility.services_offered && facility.services_offered.length > 0 && (
                  <Box>
                    <Typography variant="body2" fontWeight="medium" mb={1}>
                      Services:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {facility.services_offered.slice(0, 3).map((service, index) => (
                        <Chip
                          key={index}
                          label={service.replace('_', ' ')}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                      {facility.services_offered.length > 3 && (
                        <Chip
                          label={`+${facility.services_offered.length - 3} more`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredFacilities.length === 0 && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <Typography color="text.secondary">
            No facilities found matching your criteria
          </Typography>
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, facility: null })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDialog.facility?.name}"? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, facility: null })}>
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            disabled={deleteMutation.isLoading}
          >
            {deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FacilityManagement;
