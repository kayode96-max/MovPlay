import { Box, Typography, Paper } from '@mui/material';
import AuthForm from '../components/AuthForm';

const Register = () => (
  <Box 
    component="main"
    sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}
    role="main"
    aria-labelledby="register-heading"
  >
    <Paper elevation={3} sx={{ p: 4, minWidth: 350 }}>
      <Typography 
        id="register-heading"
        variant="h4" 
        component="h1"
        gutterBottom
      >
        Register
      </Typography>
      <AuthForm mode="register" onAuth={(data) => {
        localStorage.setItem('token', data.token);
        window.location.href = '/profile';
      }} />
    </Paper>
  </Box>
);

export default Register;
