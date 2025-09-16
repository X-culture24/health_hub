import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  useTheme,
  alpha
} from '@mui/material';
import {
  LocalHospital as HospitalIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';

const Welcome = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const features = [
    {
      icon: <HospitalIcon sx={{ fontSize: 40 }} />,
      title: 'Health Programs',
      description: 'Manage and track health programs for patients'
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      title: 'Patient Management',
      description: 'Comprehensive patient records and history'
    },
    {
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      title: 'Appointments',
      description: 'Schedule and manage patient appointments'
    },
    {
      icon: <TimelineIcon sx={{ fontSize: 40 }} />,
      title: 'Health Metrics',
      description: 'Track and analyze patient health metrics'
    }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
        py: 8
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Hero Section */}
          <Grid xs={12} textAlign="center" mb={8}>
            <Typography
              variant="h2"
              component="h1"
              sx={{
                color: 'white',
                fontWeight: 'bold',
                mb: 3,
                textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                fontSize: { xs: '2.5rem', md: '3.75rem' }
              }}
            >
              Health Hub
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: 'white',
                mb: 6,
                opacity: 0.9,
                fontSize: { xs: '1.25rem', md: '1.5rem' },
                maxWidth: '600px',
                mx: 'auto'
              }}
            >
              Comprehensive Healthcare Management System
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              gap: 3, 
              justifyContent: 'center',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center'
            }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/login')}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  minWidth: '140px',
                  '&:hover': {
                    bgcolor: alpha('#fff', 0.9),
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Login
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  minWidth: '140px',
                  borderWidth: '2px',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: alpha('#fff', 0.1),
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(255,255,255,0.2)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Register
              </Button>
            </Box>
          </Grid>

          {/* Features Section */}
          <Grid xs={12}>
            <Typography
              variant="h4"
              component="h2"
              sx={{
                color: 'white',
                textAlign: 'center',
                mb: 4,
                fontWeight: 'bold',
                textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
              }}
            >
              Key Features
            </Typography>
            <Grid container spacing={4} sx={{ px: { xs: 2, md: 4 }, py: 2, justifyContent: 'center' }}>
              {features.map((feature, index) => (
                <Grid xs={12} md={6} key={index} sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                  <Card
                    sx={{
                      width: '100%',
                      maxWidth: { xs: '100%', md: '400px' },
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      bgcolor: alpha('#fff', 0.95),
                      backdropFilter: 'blur(10px)',
                      borderRadius: 3,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      transition: 'all 0.3s ease-in-out',
                      mx: 'auto',
                      '&:hover': {
                        transform: 'translateY(-12px)',
                        boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
                        bgcolor: '#fff'
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 5 }}>
                      <Box
                        sx={{
                          color: 'primary.main',
                          mb: 3,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          width: 80,
                          height: 80,
                          borderRadius: '50%',
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          mx: 'auto',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Typography 
                        variant="h6" 
                        component="h3" 
                        gutterBottom
                        sx={{ 
                          fontWeight: 'bold',
                          color: 'text.primary',
                          mb: 2
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          lineHeight: 1.6,
                          fontSize: '0.95rem',
                          mb: 1
                        }}
                      >
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Welcome; 