import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Stack
} from '@mui/material';
import {
  People as PeopleIcon,
  Event as EventIcon,
  Assignment as AssignmentIcon,
  LocalHospital as LocalHospitalIcon,
  TrendingUp as TrendingUpIcon,
  Description as DescriptionIcon,
  ArrowForward as ArrowForwardIcon,
  School as SchoolIcon,
  LocalPharmacy as LocalPharmacyIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalClients: 0,
    activePrograms: 0,
    totalPrescriptions: 0,
    metrics: []
  });

  useEffect(() => {
    // Simulated data for development
    setStats({
      totalClients: 150,
      activePrograms: 12,
      totalPrescriptions: 50,
      metrics: []
    });
  }, []);

  const StatCard = ({ title, value, icon, color, onClick }) => (
    <Card 
      sx={{ 
        height: '100%', 
        bgcolor: color, 
        color: 'white',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { 
          transform: 'translateY(-4px)',
          boxShadow: 4,
          transition: 'all 0.3s ease-in-out'
        } : {}
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          {icon}
          <Typography variant="h4">{value}</Typography>
        </Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" mt={2}>
          <Typography variant="subtitle1">{title}</Typography>
          {onClick && <ArrowForwardIcon />}
        </Box>
      </CardContent>
    </Card>
  );

  const quickActions = [
    {
      title: "Clients",
      description: "View and manage client profiles",
      icon: <PeopleIcon />,
      path: "/clients"
    },
    {
      title: "Programs",
      description: "Manage healthcare programs",
      icon: <SchoolIcon />,
      path: "/programs"
    },
    {
      title: "Prescriptions",
      description: "Manage prescriptions",
      icon: <LocalPharmacyIcon />,
      path: "/prescriptions"
    },
    {
      title: "Reports",
      description: "View analytics and reports",
      icon: <AssessmentIcon />,
      path: "/reports"
    }
  ];

  return (
    <Box sx={{ height: '100vh', overflow: 'auto', bgcolor: '#f5f5f5', p: 3 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
          Dashboard
        </Typography>

        <Grid container spacing={3}>
          {/* Statistics Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Clients"
              value={stats.totalClients}
              icon={<PeopleIcon fontSize="large" />}
              color="#1976d2"
              onClick={() => navigate('/clients')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Programs"
              value={stats.activePrograms}
              icon={<LocalHospitalIcon fontSize="large" />}
              color="#2196f3"
              onClick={() => navigate('/programs')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Prescriptions"
              value={stats.totalPrescriptions}
              icon={<LocalPharmacyIcon fontSize="large" />}
              color="#00bcd4"
              onClick={() => navigate('/prescriptions')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Recent Reports"
              value={stats.metrics.length}
              icon={<DescriptionIcon fontSize="large" />}
              color="#4caf50"
              onClick={() => navigate('/reports')}
            />
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Quick Links
              </Typography>
              <Grid container spacing={3}>
                {quickActions.map((link, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 3,
                          transition: 'all 0.3s ease-in-out'
                        }
                      }}
                      onClick={() => navigate(link.path)}
                    >
                      <CardContent>
                        <Stack spacing={2} alignItems="center" textAlign="center">
                          <IconButton 
                            sx={{ 
                              bgcolor: 'primary.light',
                              '&:hover': { bgcolor: 'primary.main' }
                            }}
                          >
                            {link.icon}
                          </IconButton>
                          <Typography variant="h6" component="div">
                            {link.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {link.description}
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Recent Activity
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <TrendingUpIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="System Overview"
                    secondary="Track your health system's performance and metrics"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <EventIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Today's Schedule"
                    secondary="View and manage your appointments"
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <AssignmentIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Reports Overview"
                    secondary="Access and generate health reports"
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard; 