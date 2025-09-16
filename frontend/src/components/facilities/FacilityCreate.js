import React, { useState } from 'react';
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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from 'react-query';
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

const FacilityCreate = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedServices, setSelectedServices] = useState([]);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      facility_type: '',
      level: '',
      county: '',
      sub_county: '',
      ward: '',
      address: '',
      phone_number: '',
      email: '',
      bed_capacity: '',
      is_active: true,
    }
  });

  const createMutation = useMutation(facilities.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('facilities');
      toast.success('Facility created successfully');
      navigate('/facilities');
    },
    onError: (error) => {
      toast.error('Failed to create facility');
      console.error('Create error:', error);
    }
  });

  const onSubmit = (data) => {
    const facilityData = {
      ...data,
      services_offered: selectedServices,
      operating_hours: {
        monday: { open: '08:00', close: '17:00' },
        tuesday: { open: '08:00', close: '17:00' },
        wednesday: { open: '08:00', close: '17:00' },
        thursday: { open: '08:00', close: '17:00' },
        friday: { open: '08:00', close: '17:00' },
        saturday: { open: '08:00', close: '13:00' },
        sunday: { closed: true }
      }
    };
    createMutation.mutate(facilityData);
  };

  const handleServiceChange = (event) => {
    const value = event.target.value;
    setSelectedServices(typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Create New Health Facility
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
                  disabled={createMutation.isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={createMutation.isLoading}
                >
                  {createMutation.isLoading ? 'Creating...' : 'Create Facility'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default FacilityCreate;
