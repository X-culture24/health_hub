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
          <Grid xs={12} textAlign="center" mb={4}>
            <Typography
              variant="h2"
              component="h1"
              sx={{
                color: 'white',
                fontWeight: 'bold',
                mb: 2,
                textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              Health Hub
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: 'white',
                mb: 4,
                opacity: 0.9
              }}
            >
              Comprehensive Healthcare Management System
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/login')}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: alpha('#fff', 0.9)
                  }
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
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: alpha('#fff', 0.1)
                  }
                }}
              >
                Register
              </Button>
            </Box>
          </Grid>

          {/* Features Section */}
          <Grid xs={12}>
            <Grid container spacing={3}>
              {features.map((feature, index) => (
                <Grid xs={12} sm={6} md={3} key={index}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      bgcolor: alpha('#fff', 0.9),
                      backdropFilter: 'blur(10px)',
                      transition: 'transform 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-8px)'
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                      <Box
                        sx={{
                          color: 'primary.main',
                          mb: 2
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
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