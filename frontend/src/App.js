import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { AuthProvider } from './context/AuthContext';

// Components
import Dashboard from './components/Dashboard';
import ClientList from './components/clients/ClientList';
import ClientProfile from './components/clients/ClientProfile';
import ClientRegistration from './components/clients/ClientRegistration';
import ProgramList from './components/programs/ProgramList';
import ProgramCreate from './components/programs/ProgramCreate';
import EnrollmentCreate from './components/enrollments/EnrollmentCreate';
import Layout from './components/Layout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Unauthorized from './components/Unauthorized';
import Reports from './components/Reports';
import Appointments from './components/appointments/Appointments';
import AppointmentCreate from './components/appointments/AppointmentCreate';
import Prescriptions from './components/prescriptions/Prescriptions';
import PrescriptionCreate from './components/prescriptions/PrescriptionCreate';
import Metrics from './components/metrics/Metrics';
import MetricRecord from './components/metrics/MetricRecord';
import Settings from './components/settings/Settings';
import Welcome from './components/Welcome';
import UserProfile from './components/UserProfile';
import ProgramView from './components/programs/ProgramView';
import ProgramEdit from './components/programs/ProgramEdit';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Client Routes */}
              <Route path="/clients" element={<ClientList />} />
              <Route path="/clients/register" element={<ClientRegistration />} />
              <Route path="/clients/:id" element={<ClientProfile />} />
              
              {/* Program Routes */}
              <Route path="/programs" element={<ProgramList />} />
              <Route path="/programs/create" element={<ProgramCreate />} />
              <Route path="/programs/:id" element={<ProgramView />} />
              <Route path="/programs/:id/edit" element={<ProgramEdit />} />
              
              {/* Enrollment Route */}
              <Route path="/enrollments/create" element={<EnrollmentCreate />} />
              
              {/* Appointment Routes */}
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/appointments/create" element={<AppointmentCreate />} />
              
              {/* Prescription Routes */}
              <Route path="/prescriptions" element={<Prescriptions />} />
              <Route path="/prescriptions/create" element={<PrescriptionCreate />} />
              
              {/* Metric Routes */}
              <Route path="/metrics" element={<Metrics />} />
              <Route path="/metrics/record" element={<MetricRecord />} />
              
              {/* Report Routes */}
              <Route path="/reports" element={<Reports />} />
              
              {/* User Routes */}
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<UserProfile />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
