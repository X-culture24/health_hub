import React from 'react';
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
  Card,
  CardContent,
  Chip,
  Alert,
} from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm, Controller } from 'react-hook-form';
import { facilities, shiftBookings, doctorAvailability } from '../../services/api';
import toast from 'react-hot-toast';

const ShiftBooking = () => {
  const queryClient = useQueryClient();

  const { control, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      facility: '',
      shift_date: null,
      start_time: null,
      end_time: null,
      shift_type: '',
      notes: '',
    }
  });

  const watchedFacility = watch('facility');
  const watchedDate = watch('shift_date');

  const { data: facilitiesData } = useQuery('facilities', facilities.list);

  const { data: availableSlots } = useQuery(
    ['doctor-availability', watchedFacility, watchedDate],
    () => doctorAvailability.getByFacility(watchedFacility),
    {
      enabled: !!watchedFacility && !!watchedDate,
    }
  );

  const bookingMutation = useMutation(shiftBookings.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('shift-bookings');
      toast.success('Shift booking request submitted successfully');
      reset();
    },
    onError: (error) => {
      toast.error('Failed to submit shift booking');
      console.error('Booking error:', error);
    }
  });

  const onSubmit = (data) => {
    const bookingData = {
      ...data,
      shift_date: data.shift_date?.format('YYYY-MM-DD'),
      start_time: data.start_time?.format('HH:mm'),
      end_time: data.end_time?.format('HH:mm'),
    };
    bookingMutation.mutate(bookingData);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Book a Shift
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                name="facility"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Select Facility</InputLabel>
                    <Select {...field} label="Select Facility">
                      {facilitiesData?.map((facility) => (
                        <MenuItem key={facility.id} value={facility.id}>
                          {facility.name} - {facility.county}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="shift_type"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Shift Type</InputLabel>
                    <Select {...field} label="Shift Type">
                      <MenuItem value="morning">Morning Shift</MenuItem>
                      <MenuItem value="afternoon">Afternoon Shift</MenuItem>
                      <MenuItem value="night">Night Shift</MenuItem>
                      <MenuItem value="emergency">Emergency Call</MenuItem>
                      <MenuItem value="surgery">Surgery Coverage</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="shift_date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="Shift Date"
                    slotProps={{ textField: { fullWidth: true } }}
                    minDate={new Date()}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="start_time"
                control={control}
                render={({ field }) => (
                  <TimePicker
                    {...field}
                    label="Start Time"
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Controller
                name="end_time"
                control={control}
                render={({ field }) => (
                  <TimePicker
                    {...field}
                    label="End Time"
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Additional Notes"
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Any special requirements or notes for this shift..."
                  />
                )}
              />
            </Grid>

            {watchedFacility && watchedDate && (
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Checking availability for selected facility and date...
                </Alert>
                
                {availableSlots && availableSlots.length > 0 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Available Time Slots
                    </Typography>
                    <Grid container spacing={2}>
                      {availableSlots.map((slot) => (
                        <Grid item xs={12} sm={6} md={4} key={slot.id}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="body2">
                                {slot.start_time} - {slot.end_time}
                              </Typography>
                              <Chip
                                label={slot.shift_type}
                                size="small"
                                color="primary"
                                sx={{ mt: 1 }}
                              />
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Grid>
            )}

            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => reset()}
                  disabled={bookingMutation.isLoading}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={bookingMutation.isLoading}
                >
                  {bookingMutation.isLoading ? 'Submitting...' : 'Submit Booking Request'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default ShiftBooking;
