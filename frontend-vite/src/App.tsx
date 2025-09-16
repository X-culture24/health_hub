import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { QueryClient, QueryClientProvider } from 'react-query';

// Components
import Layout from './components/Layout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/Dashboard';
import PatientList from './components/patients/PatientList';
import PatientProfile from './components/patients/PatientProfile';
import AppointmentScheduler from './components/appointments/AppointmentScheduler';
import VirtualPharmacist from './components/pharmacy/VirtualPharmacist';
import PharmacyInventory from './components/pharmacy/PharmacyInventory';
import AdminDashboard from './components/admin/AdminDashboard';
import PaymentSystem from './components/payments/PaymentSystem';
import Telemedicine from './components/telemedicine/Telemedicine';
import ProtectedRoute from './components/ProtectedRoute';
import Welcome from './components/Welcome';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
      light: '#ff5983',
      dark: '#9a0036',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Toaster position="top-right" />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Welcome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* Patient Management */}
                <Route path="/patients" element={<PatientList />} />
                <Route path="/patients/:id" element={<PatientProfile />} />
                
                {/* Appointments */}
                <Route path="/appointments" element={<AppointmentScheduler />} />
                
                {/* Pharmacy */}
                <Route path="/pharmacy/virtual" element={<VirtualPharmacist />} />
                <Route path="/pharmacy/inventory" element={<PharmacyInventory />} />
                
                {/* Payments */}
                <Route path="/payments" element={<PaymentSystem />} />
                
                {/* Telemedicine */}
                <Route path="/telemedicine" element={<Telemedicine />} />
                
                {/* Admin */}
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
