import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { shiftBookings } from '../../services/api';
import toast from 'react-hot-toast';

const ShiftManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);
  const [actionDialog, setActionDialog] = useState({ open: false, booking: null, action: null });

  const { data: bookingsData, isLoading } = useQuery('shift-bookings', shiftBookings.list);

  const confirmMutation = useMutation(shiftBookings.confirm, {
    onSuccess: () => {
      queryClient.invalidateQueries('shift-bookings');
      toast.success('Shift booking confirmed');
      setActionDialog({ open: false, booking: null, action: null });
    },
    onError: (error) => {
      toast.error('Failed to confirm booking');
      console.error('Confirm error:', error);
    }
  });

  const cancelMutation = useMutation(shiftBookings.cancel, {
    onSuccess: () => {
      queryClient.invalidateQueries('shift-bookings');
      toast.success('Shift booking cancelled');
      setActionDialog({ open: false, booking: null, action: null });
    },
    onError: (error) => {
      toast.error('Failed to cancel booking');
      console.error('Cancel error:', error);
    }
  });

  const completeMutation = useMutation(shiftBookings.complete, {
    onSuccess: () => {
      queryClient.invalidateQueries('shift-bookings');
      toast.success('Shift marked as completed');
      setActionDialog({ open: false, booking: null, action: null });
    },
    onError: (error) => {
      toast.error('Failed to complete shift');
      console.error('Complete error:', error);
    }
  });

  const handleAction = (booking, action) => {
    setActionDialog({ open: true, booking, action });
  };

  const confirmAction = () => {
    const { booking, action } = actionDialog;
    switch (action) {
      case 'confirm':
        confirmMutation.mutate(booking.id);
        break;
      case 'cancel':
        cancelMutation.mutate(booking.id);
        break;
      case 'complete':
        completeMutation.mutate(booking.id);
        break;
      default:
        break;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'warning',
      'confirmed': 'success',
      'cancelled': 'error',
      'completed': 'info',
    };
    return colors[status] || 'default';
  };

  const filterBookings = (status) => {
    if (!bookingsData) return [];
    switch (status) {
      case 'pending':
        return bookingsData.filter(b => b.status === 'pending');
      case 'confirmed':
        return bookingsData.filter(b => b.status === 'confirmed');
      case 'completed':
        return bookingsData.filter(b => b.status === 'completed');
      default:
        return bookingsData;
    }
  };

  const renderBookingCard = (booking) => (
    <Grid item xs={12} md={6} lg={4} key={booking.id}>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="between" alignItems="flex-start" mb={2}>
            <Typography variant="h6" component="h3">
              {booking.facility?.name}
            </Typography>
            <Chip
              label={booking.status?.toUpperCase()}
              color={getStatusColor(booking.status)}
              size="small"
            />
          </Box>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            Doctor: {booking.doctor?.first_name} {booking.doctor?.last_name}
          </Typography>

          <Typography variant="body2" gutterBottom>
            Date: {new Date(booking.shift_date).toLocaleDateString()}
          </Typography>

          <Typography variant="body2" gutterBottom>
            Time: {booking.start_time} - {booking.end_time}
          </Typography>

          <Typography variant="body2" gutterBottom>
            Type: {booking.shift_type?.replace('_', ' ').toUpperCase()}
          </Typography>

          {booking.hourly_rate && (
            <Typography variant="body2" gutterBottom>
              Rate: KES {booking.hourly_rate}/hour
            </Typography>
          )}

          {booking.notes && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Notes: {booking.notes}
            </Typography>
          )}

          <Box display="flex" gap={1} justifyContent="flex-end" sx={{ mt: 2 }}>
            {booking.status === 'pending' && (
              <>
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  startIcon={<CheckIcon />}
                  onClick={() => handleAction(booking, 'confirm')}
                >
                  Confirm
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => handleAction(booking, 'cancel')}
                >
                  Cancel
                </Button>
              </>
            )}
            {booking.status === 'confirmed' && (
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={() => handleAction(booking, 'complete')}
              >
                Mark Complete
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading shift bookings...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Shift Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/shifts/book')}
        >
          Book New Shift
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="All Shifts" />
          <Tab label="Pending" />
          <Tab label="Confirmed" />
          <Tab label="Completed" />
        </Tabs>
      </Box>

      <Grid container spacing={3}>
        {tabValue === 0 && filterBookings('all').map(renderBookingCard)}
        {tabValue === 1 && filterBookings('pending').map(renderBookingCard)}
        {tabValue === 2 && filterBookings('confirmed').map(renderBookingCard)}
        {tabValue === 3 && filterBookings('completed').map(renderBookingCard)}
      </Grid>

      {filterBookings(['all', 'pending', 'confirmed', 'completed'][tabValue]).length === 0 && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <Typography color="text.secondary">
            No shift bookings found for this category
          </Typography>
        </Box>
      )}

      {/* Action Confirmation Dialog */}
      <Dialog
        open={actionDialog.open}
        onClose={() => setActionDialog({ open: false, booking: null, action: null })}
      >
        <DialogTitle>
          Confirm {actionDialog.action?.charAt(0).toUpperCase() + actionDialog.action?.slice(1)}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {actionDialog.action} this shift booking?
          </Typography>
          {actionDialog.booking && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Facility:</strong> {actionDialog.booking.facility?.name}<br />
                <strong>Date:</strong> {new Date(actionDialog.booking.shift_date).toLocaleDateString()}<br />
                <strong>Time:</strong> {actionDialog.booking.start_time} - {actionDialog.booking.end_time}
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog({ open: false, booking: null, action: null })}>
            Cancel
          </Button>
          <Button
            onClick={confirmAction}
            color={actionDialog.action === 'cancel' ? 'error' : 'primary'}
            disabled={confirmMutation.isLoading || cancelMutation.isLoading || completeMutation.isLoading}
          >
            {(confirmMutation.isLoading || cancelMutation.isLoading || completeMutation.isLoading) 
              ? 'Processing...' 
              : `${actionDialog.action?.charAt(0).toUpperCase() + actionDialog.action?.slice(1)}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShiftManagement;
