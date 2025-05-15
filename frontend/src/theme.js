import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Light blue
      dark: '#0d47a1', // Navy blue
    },
    secondary: {
      main: '#0d47a1', // Navy blue
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Poppins", sans-serif',
    h1: {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 600,
    },
    h2: {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 600,
    },
    h3: {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 600,
    },
    subtitle1: {
      fontFamily: '"Roboto", sans-serif',
      fontWeight: 500,
    },
    subtitle2: {
      fontFamily: '"Roboto", sans-serif',
      fontWeight: 500,
    },
    body1: {
      fontFamily: '"Roboto", sans-serif',
    },
    body2: {
      fontFamily: '"Roboto", sans-serif',
    },
    button: {
      fontFamily: '"Roboto", sans-serif',
      fontWeight: 500,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '@global': {
          '@import': 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&family=Roboto:wght@300;400;500&display=swap',
        },
        body: {
          scrollbarColor: '#0d47a1 #f5f5f5',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: '4px',
            backgroundColor: '#0d47a1',
          },
          '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
            borderRadius: '4px',
            backgroundColor: '#f5f5f5',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          padding: '8px 16px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontFamily: '"Roboto", sans-serif',
        },
        head: {
          fontFamily: '"Poppins", sans-serif',
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            fontFamily: '"Roboto", sans-serif',
          },
          '& .MuiInputLabel-root': {
            fontFamily: '"Roboto", sans-serif',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          fontFamily: '"Roboto", sans-serif',
        },
      },
    },
  },
});

export default theme; 