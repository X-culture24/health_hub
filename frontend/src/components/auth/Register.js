import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Container,
  Alert,
  FormControlLabel,
  Checkbox,
  Grid,
  CircularProgress
} from '@mui/material';
import authAPI from '../../services/authAPI';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    work_email: '',
    employer_id: '',
    password: '',
    password2: '',
    is_doctor: false,
    is_nurse: false,
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    // Username validation
    if (!formData.username) {
      newErrors.username = 'Username is required';
    }

    // Work email validation
    if (!formData.work_email) {
      newErrors.work_email = 'Work email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.work_email)) {
      newErrors.work_email = 'Invalid work email format';
    }

    // Employer ID validation
    if (!formData.employer_id) {
      newErrors.employer_id = 'Employer ID is required';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!formData.password2) {
      newErrors.password2 = 'Please confirm your password';
    } else if (formData.password !== formData.password2) {
      newErrors.password2 = 'Passwords do not match';
    }

    // Role validation
    if (!formData.is_doctor && !formData.is_nurse) {
      newErrors.role = 'Please select at least one role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: e.target.type === 'checkbox' ? checked : value
    }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { password2, ...registrationData } = formData;
      const response = await authAPI.register({
        username: registrationData.username,
        password: registrationData.password,
        work_email: registrationData.work_email,
        employer_id: registrationData.employer_id,
        is_doctor: registrationData.is_doctor,
        is_nurse: registrationData.is_nurse
      });
      
      // If registration is successful, navigate to login
      navigate('/login', { 
        state: { 
          message: 'Registration successful! Please login with your credentials.' 
        }
      });
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Registration failed';
      
      // Handle specific error cases
      if (errorMessage.includes('work_email')) {
        setErrors(prev => ({
          ...prev,
          work_email: 'This work email is already registered'
        }));
      } else if (errorMessage.includes('username')) {
        setErrors(prev => ({
          ...prev,
          username: 'This username is already taken'
        }));
      } else if (errorMessage.includes('employer_id')) {
        setErrors(prev => ({
          ...prev,
          employer_id: 'This employer ID is already registered'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          general: errorMessage
        }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <Card sx={{ width: '100%', my: 4 }}>
          <CardContent>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              Staff Registration
            </Typography>
            
            {errors.general && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.general}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                margin="normal"
                error={!!errors.username}
                helperText={errors.username}
                disabled={isSubmitting}
              />
              
              <TextField
                fullWidth
                label="Work Email"
                name="work_email"
                type="email"
                value={formData.work_email}
                onChange={handleChange}
                margin="normal"
                error={!!errors.work_email}
                helperText={errors.work_email}
                disabled={isSubmitting}
              />
              
              <TextField
                fullWidth
                label="Employer ID"
                name="employer_id"
                value={formData.employer_id}
                onChange={handleChange}
                margin="normal"
                error={!!errors.employer_id}
                helperText={errors.employer_id}
                disabled={isSubmitting}
              />
              
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                error={!!errors.password}
                helperText={errors.password}
                disabled={isSubmitting}
              />
              
              <TextField
                fullWidth
                label="Confirm Password"
                name="password2"
                type="password"
                value={formData.password2}
                onChange={handleChange}
                margin="normal"
                error={!!errors.password2}
                helperText={errors.password2}
                disabled={isSubmitting}
              />

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Role Selection
                </Typography>
                {errors.role && (
                  <Typography color="error" variant="caption" display="block" gutterBottom>
                    {errors.role}
                  </Typography>
                )}
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.is_doctor}
                          onChange={handleChange}
                          name="is_doctor"
                          disabled={isSubmitting}
                        />
                      }
                      label="Doctor"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.is_nurse}
                          onChange={handleChange}
                          name="is_nurse"
                          disabled={isSubmitting}
                        />
                      }
                      label="Nurse"
                    />
                  </Grid>
                </Grid>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={24} /> : 'Register'}
              </Button>

              <Button
                fullWidth
                variant="text"
                onClick={() => navigate('/login')}
                disabled={isSubmitting}
              >
                Already have an account? Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default Register; 