import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import Register from '../Register';

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock the auth context
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    register: jest.fn(),
  }),
  AuthProvider: ({ children }) => <div>{children}</div>,
}));

const renderRegister = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Register />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders register form', () => {
    renderRegister();
    
    // Check if all form fields are present
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/work email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/employer id/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  test('validates required fields', async () => {
    renderRegister();
    
    // Try to submit empty form
    const submitButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(submitButton);

    // Check for validation messages
    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
      expect(screen.getByText(/work email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/employer id is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  test('validates password match', async () => {
    renderRegister();
    
    // Fill in passwords that don't match
    fireEvent.change(screen.getByLabelText(/^password/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'password456' },
    });

    const submitButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(submitButton);

    // Check for password match error
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  test('validates email format', async () => {
    renderRegister();
    
    // Fill in invalid email
    fireEvent.change(screen.getByLabelText(/work email/i), {
      target: { value: 'invalid-email' },
    });

    const submitButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(submitButton);

    // Check for email format error
    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
  });

  test('submits form with valid data', async () => {
    const mockRegister = jest.fn().mockResolvedValueOnce({});
    jest.spyOn(require('../../context/AuthContext'), 'useAuth').mockImplementation(() => ({
      register: mockRegister,
    }));

    renderRegister();
    
    // Fill in valid form data
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/work email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/employer id/i), {
      target: { value: 'EMP123' },
    });
    fireEvent.change(screen.getByLabelText(/^password/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'password123' },
    });

    const submitButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(submitButton);

    // Check if register function was called with correct data
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        username: 'testuser',
        work_email: 'test@example.com',
        employer_id: 'EMP123',
        password: 'password123',
        password2: 'password123',
      });
    });
  });
}); 