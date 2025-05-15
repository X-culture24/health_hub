import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import Settings from '../settings/Settings';

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock the auth context
const mockUser = {
  id: 1,
  username: 'testuser',
  work_email: 'test@example.com',
  employer_id: 'EMP123',
  is_doctor: true,
  is_nurse: false,
  first_name: 'Test',
  last_name: 'User'
};

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    updateProfile: jest.fn(),
  }),
  AuthProvider: ({ children }) => <div>{children}</div>,
}));

const renderSettings = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Settings />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Settings Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders settings tabs', () => {
    renderSettings();
    
    // Check if all tabs are present
    expect(screen.getByRole('tab', { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /password/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /preferences/i })).toBeInTheDocument();
  });

  test('switches between tabs', () => {
    renderSettings();
    
    // Click on Password tab
    const passwordTab = screen.getByRole('tab', { name: /password/i });
    fireEvent.click(passwordTab);

    // Check if password form is visible
    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();

    // Click on Preferences tab
    const preferencesTab = screen.getByRole('tab', { name: /preferences/i });
    fireEvent.click(preferencesTab);

    // Check if preferences form is visible
    expect(screen.getByLabelText(/timezone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date format/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/theme/i)).toBeInTheDocument();
  });

  test('handles password change', async () => {
    const mockUpdateProfile = jest.fn().mockResolvedValueOnce({});
    jest.spyOn(require('../../context/AuthContext'), 'useAuth').mockImplementation(() => ({
      user: mockUser,
      updateProfile: mockUpdateProfile,
    }));

    renderSettings();
    
    // Switch to Password tab
    const passwordTab = screen.getByRole('tab', { name: /password/i });
    fireEvent.click(passwordTab);

    // Fill in password fields
    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: 'currentpass' },
    });
    fireEvent.change(screen.getByLabelText(/new password/i), {
      target: { value: 'newpass' },
    });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: { value: 'newpass' },
    });

    // Submit password change
    const submitButton = screen.getByRole('button', { name: /change password/i });
    fireEvent.click(submitButton);

    // Check if updateProfile was called with password data
    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        current_password: 'currentpass',
        new_password: 'newpass',
        confirm_password: 'newpass',
      });
    });
  });

  test('handles preferences update', async () => {
    const mockUpdateProfile = jest.fn().mockResolvedValueOnce({});
    jest.spyOn(require('../../context/AuthContext'), 'useAuth').mockImplementation(() => ({
      user: mockUser,
      updateProfile: mockUpdateProfile,
    }));

    renderSettings();
    
    // Switch to Preferences tab
    const preferencesTab = screen.getByRole('tab', { name: /preferences/i });
    fireEvent.click(preferencesTab);

    // Change preferences
    fireEvent.change(screen.getByLabelText(/timezone/i), {
      target: { value: 'America/New_York' },
    });
    fireEvent.change(screen.getByLabelText(/date format/i), {
      target: { value: 'MM/DD/YYYY' },
    });
    fireEvent.change(screen.getByLabelText(/theme/i), {
      target: { value: 'dark' },
    });

    // Submit preferences
    const submitButton = screen.getByRole('button', { name: /save preferences/i });
    fireEvent.click(submitButton);

    // Check if updateProfile was called with preferences data
    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({
        timezone: 'America/New_York',
        dateFormat: 'MM/DD/YYYY',
        theme: 'dark',
      });
    });
  });

  test('validates password match in password change', async () => {
    renderSettings();
    
    // Switch to Password tab
    const passwordTab = screen.getByRole('tab', { name: /password/i });
    fireEvent.click(passwordTab);

    // Fill in mismatched passwords
    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: 'currentpass' },
    });
    fireEvent.change(screen.getByLabelText(/new password/i), {
      target: { value: 'newpass1' },
    });
    fireEvent.change(screen.getByLabelText(/confirm new password/i), {
      target: { value: 'newpass2' },
    });

    // Submit password change
    const submitButton = screen.getByRole('button', { name: /change password/i });
    fireEvent.click(submitButton);

    // Check for password match error
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });
}); 