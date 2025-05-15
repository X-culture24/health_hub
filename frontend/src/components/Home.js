import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActionArea,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PeopleIcon from '@mui/icons-material/People';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import { useNavigate } from 'react-router-dom';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: `0 0 20px ${theme.palette.primary.light}`,
    '& .MuiSvgIcon-root': {
      color: theme.palette.primary.main,
      transform: 'scale(1.1)',
    },
  },
  '& .MuiCardContent-root': {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(3),
  },
  '& .MuiSvgIcon-root': {
    fontSize: 48,
    marginBottom: theme.spacing(2),
    transition: 'all 0.3s ease-in-out',
    color: theme.palette.text.secondary,
  },
  '& .MuiTypography-h5': {
    marginBottom: theme.spacing(1),
    fontWeight: 600,
    textAlign: 'center',
  },
  '& .MuiTypography-body2': {
    color: theme.palette.text.secondary,
    textAlign: 'center',
  },
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  height: '100%',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: `0 0 20px ${theme.palette.info.light}`,
  },
  '& .stat-value': {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(1),
  },
  '& .stat-label': {
    color: theme.palette.text.secondary,
    textAlign: 'center',
  },
}));

const Home = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeClients: 0,
    activePrograms: 0,
    activePrescriptions: 0,
    activeServices: 0,
  });

  useEffect(() => {
    // Fetch real statistics from your API
    const fetchStats = async () => {
      try {
        // Add your API calls here
        // For now, we'll simulate loading
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const services = [
    {
      title: 'Client Management',
      description: 'Register and manage client profiles, view medical history',
      icon: <PeopleIcon />,
      path: '/clients',
    },
    {
      title: 'Prescriptions',
      description: 'Create and manage prescriptions for clients',
      icon: <MedicalServicesIcon />,
      path: '/prescriptions',
    },
    {
      title: 'Health Programs',
      description: 'Manage health programs and client enrollments',
      icon: <HealthAndSafetyIcon />,
      path: '/programs',
    },
    {
      title: 'Reports',
      description: 'Generate and view detailed health reports',
      icon: <AssessmentIcon />,
      path: '/reports',
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Welcome to Health Hub
      </Typography>

      <Grid container spacing={4}>
        {services.map((service, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StyledCard>
              <CardActionArea onClick={() => navigate(service.path)}>
                <CardContent>
                  {service.icon}
                  <Typography variant="h5" component="h2">
                    {service.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {service.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </StyledCard>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          System Overview
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard elevation={3}>
              <Typography className="stat-value">{stats.activeClients}</Typography>
              <Typography className="stat-label">Active Clients</Typography>
            </StatCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard elevation={3}>
              <Typography className="stat-value">{stats.activePrograms}</Typography>
              <Typography className="stat-label">Active Programs</Typography>
            </StatCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard elevation={3}>
              <Typography className="stat-value">{stats.activePrescriptions}</Typography>
              <Typography className="stat-label">Active Prescriptions</Typography>
            </StatCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard elevation={3}>
              <Typography className="stat-value">{stats.activeServices}</Typography>
              <Typography className="stat-label">Active Services</Typography>
            </StatCard>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Home; 