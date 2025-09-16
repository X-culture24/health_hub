import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import theme from './theme';
import { AuthProvider } from './context/AuthContext';

// Core Components
import Dashboard from './components/Dashboard';
import Layout from './components/Layout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Unauthorized from './components/Unauthorized';
import Welcome from './components/Welcome';

// Client Components
import ClientList from './components/clients/ClientList';
import ClientProfile from './components/clients/ClientProfile';
import ClientRegistration from './components/clients/ClientRegistration';

// Appointment Components
import Appointments from './components/appointments/Appointments';
import AppointmentCreate from './components/appointments/AppointmentCreate';

// Prescription Components
import Prescriptions from './components/prescriptions/Prescriptions';
import PrescriptionCreate from './components/prescriptions/PrescriptionCreate';
import PrescriptionEdit from './components/PrescriptionEdit';

// Kenya Health System - New Components
import FacilityManagement from './components/facilities/FacilityManagement';
import FacilityCreate from './components/facilities/FacilityCreate';
import FacilityEdit from './components/facilities/FacilityEdit';
import DepartmentManagement from './components/departments/DepartmentManagement';
import StaffManagement from './components/staff/StaffManagement';
import ShiftBooking from './components/shifts/ShiftBooking';
import ShiftManagement from './components/shifts/ShiftManagement';
import SurgeryScheduling from './components/surgery/SurgeryScheduling';
import SurgeryManagement from './components/surgery/SurgeryManagement';
import VirtualPharmacist from './components/pharmacy/VirtualPharmacist';
import PharmacyInventory from './components/pharmacy/PharmacyInventory';
import PaymentManagement from './components/payments/PaymentManagement';
import TelemedicineConsole from './components/telemedicine/TelemedicineConsole';
import Reports from './components/Reports';
import SystemSettings from './components/settings/SystemSettings';

// Legacy Components
import ProgramList from './components/programs/ProgramList';
import ProgramCreate from './components/programs/ProgramCreate';
import ProgramView from './components/programs/ProgramView';
import ProgramEdit from './components/programs/ProgramEdit';
import EnrollmentCreate from './components/enrollments/EnrollmentCreate';
import EnrollmentsList from './components/enrollments/EnrollmentsList';
import Metrics from './components/metrics/Metrics';
import MetricRecord from './components/metrics/MetricRecord';
import EncounterList from './components/EncounterList';

// Create React Query client
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
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Welcome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* Patient/Client Management */}
                <Route path="/patients" element={<ClientList />} />
                <Route path="/patients/register" element={<ClientRegistration />} />
                <Route path="/patients/:id" element={<ClientProfile />} />
                
                {/* Facility Management */}
                <Route path="/facilities" element={<FacilityManagement />} />
                <Route path="/facilities/create" element={<FacilityCreate />} />
                <Route path="/facilities/:id/edit" element={<FacilityEdit />} />
                
                {/* Department Management */}
                <Route path="/departments" element={<DepartmentManagement />} />
                
                {/* Staff Management */}
                <Route path="/staff" element={<StaffManagement />} />
                
                {/* Appointment Management */}
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/appointments/create" element={<AppointmentCreate />} />
                
                {/* Shift Booking System */}
                <Route path="/shifts" element={<ShiftManagement />} />
                <Route path="/shifts/book" element={<ShiftBooking />} />
                
                {/* Surgery Management */}
                <Route path="/surgeries" element={<SurgeryManagement />} />
                <Route path="/surgeries/schedule" element={<SurgeryScheduling />} />
                
                {/* Pharmacy Management */}
                <Route path="/pharmacy/inventory" element={<PharmacyInventory />} />
                <Route path="/pharmacy/virtual-pharmacist" element={<VirtualPharmacist />} />
                
                {/* Prescription Management */}
                <Route path="/prescriptions" element={<Prescriptions />} />
                <Route path="/prescriptions/create" element={<PrescriptionCreate />} />
                <Route path="/prescriptions/:id" element={<PrescriptionEdit />} />
                
                {/* Payment Management */}
                <Route path="/payments" element={<PaymentManagement />} />
                
                {/* Telemedicine */}
                <Route path="/telemedicine" element={<TelemedicineConsole />} />
                
                {/* Reports and Analytics */}
                <Route path="/reports" element={<Reports />} />
                
                {/* System Settings */}
                <Route path="/settings" element={<SystemSettings />} />
                
                {/* Legacy Routes - Health Programs */}
                <Route path="/programs" element={<ProgramList />} />
                <Route path="/programs/create" element={<ProgramCreate />} />
                <Route path="/programs/:id" element={<ProgramView />} />
                <Route path="/programs/:id/edit" element={<ProgramEdit />} />
                
                {/* Legacy Routes - Enrollments */}
                <Route path="/enrollments" element={<EnrollmentsList />} />
                <Route path="/enrollments/create" element={<EnrollmentCreate />} />
                
                {/* Legacy Routes - Metrics */}
                <Route path="/metrics" element={<Metrics />} />
                <Route path="/metrics/record" element={<MetricRecord />} />
                
                {/* Legacy Routes - Encounters */}
                <Route path="/encounters" element={<EncounterList />} />
              </Route>
            </Routes>
          </Router>
          <Toaster position="top-right" />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
