import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Switch,
  Chip,
  OutlinedInput,
  FormHelperText,
  CircularProgress,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { facilities } from '../../services/api';
import toast from 'react-hot-toast';

const schema = yup.object().shape({
  name: yup.string().required('Facility name is required'),
  facility_type: yup.string().required('Facility type is required'),
  level: yup.string().required('Facility level is required'),
  county: yup.string().required('County is required'),
  sub_county: yup.string().required('Sub-county is required'),
  ward: yup.string().required('Ward is required'),
  address: yup.string().required('Address is required'),
  phone_number: yup.string().required('Phone number is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  bed_capacity: yup.number().positive('Must be positive').required('Bed capacity is required'),
});

const FACILITY_TYPES = [
  { value: 'national_hospital', label: 'National Referral Hospital' },
  { value: 'county_hospital', label: 'County Referral Hospital' },
  { value: 'sub_county_hospital', label: 'Sub-County Hospital' },
  { value: 'district_hospital', label: 'District Hospital' },
  { value: 'health_center', label: 'Health Center' },
  { value: 'dispensary', label: 'Dispensary' },
  { value: 'clinic', label: 'Private Clinic' },
];

const FACILITY_LEVELS = [
  { value: 'level_6', label: 'Level 6 (National Referral)' },
  { value: 'level_5', label: 'Level 5 (County Referral)' },
  { value: 'level_4', label: 'Level 4 (Sub-County)' },
  { value: 'level_3', label: 'Level 3 (Health Center)' },
  { value: 'level_2', label: 'Level 2 (Dispensary)' },
  { value: 'level_1', label: 'Level 1 (Community Unit)' },
];

const SERVICES = [
  'general_medicine',
  'emergency',
  'surgery',
  'maternity',
  'pediatrics',
  'laboratory',
  'pharmacy',
  'radiology',
  'dental',
  'mental_health',
  'nutrition',
  'immunization',
  'family_planning',
  'antenatal_care',
  'hiv_testing',
  'tb_treatment',
];

const FacilityEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [selectedServices, setSelectedServices] = useState([]);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const { data: facility, isLoading } = useQuery(
    ['facility', id],
    () => facilities.getById(id),
    {
      onSuccess: (data) => {
        reset(data);
        setSelectedServices(data.services_offered || []);
      },
      onError: (error) => {
        toast.error('Failed to load facility');
        console.error('Error loading facility:', error);
      }
    }
  );

  const updateMutation = useMutation(
    (data) => facilities.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('facilities');
        queryClient.invalidateQueries(['facility', id]);
        toast.success('Facility updated successfully');
        navigate('/facilities');
      },
      onError: (error) => {
        toast.error('Failed to update facility');
        console.error('Update error:', error);
      }
    }
  );

  const onSubmit = (data) => {
    const facilityData = {
      ...data,
      services_offered: selectedServices,
    };
    updateMutation.mutate(facilityData);
  };

  const handleServiceChange = (event) => {
    const value = event.target.value;
    setSelectedServices(typeof value === 'string' ? value.split(',') : value);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Edit Health Facility
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Facility Name"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="facility_type"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.facility_type}>
                    <InputLabel>Facility Type</InputLabel>
                    <Select {...field} label="Facility Type">
                      {FACILITY_TYPES.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{errors.facility_type?.message}</FormHelperText>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="level"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.level}>
                    <InputLabel>Facility Level</InputLabel>
                    <Select {...field} label="Facility Level">
                      {FACILITY_LEVELS.map((level) => (
                        <MenuItem key={level.value} value={level.value}>
                          {level.label}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{errors.level?.message}</FormHelperText>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="bed_capacity"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Bed Capacity"
                    type="number"
                    fullWidth
                    error={!!errors.bed_capacity}
                    helperText={errors.bed_capacity?.message}
                  />
                )}
              />
            </Grid>

            {/* Location Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Location Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="county"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="County"
                    fullWidth
                    error={!!errors.county}
                    helperText={errors.county?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="sub_county"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Sub-County"
                    fullWidth
                    error={!!errors.sub_county}
                    helperText={errors.sub_county?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="ward"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Ward"
                    fullWidth
                    error={!!errors.ward}
                    helperText={errors.ward?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Physical Address"
                    fullWidth
                    multiline
                    rows={2}
                    error={!!errors.address}
                    helperText={errors.address?.message}
                  />
                )}
              />
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Contact Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="phone_number"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Phone Number"
                    fullWidth
                    error={!!errors.phone_number}
                    helperText={errors.phone_number?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email Address"
                    type="email"
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Grid>

            {/* Services Offered */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Services Offered
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Services</InputLabel>
                <Select
                  multiple
                  value={selectedServices}
                  onChange={handleServiceChange}
                  input={<OutlinedInput label="Services" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value.replace('_', ' ')} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {SERVICES.map((service) => (
                    <MenuItem key={service} value={service}>
                      {service.replace('_', ' ').toUpperCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Status */}
            <Grid item xs={12}>
              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="Active Facility"
                  />
                )}
              />
            </Grid>

            {/* Actions */}
            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end" sx={{ mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/facilities')}
                  disabled={updateMutation.isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={updateMutation.isLoading}
                >
                  {updateMutation.isLoading ? 'Updating...' : 'Update Facility'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default FacilityEdit;
