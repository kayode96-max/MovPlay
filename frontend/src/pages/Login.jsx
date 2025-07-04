import { Box, Typography, Paper } from '@mui/material';
import AuthForm from '../components/AuthForm';

const Login = () => (
  <Box 
    component="main"
    sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}
    role="main"
    aria-labelledby="login-heading"
  >
    <Paper elevation={3} sx={{ p: 4, minWidth: 350 }}>
      <Typography 
        id="login-heading"
        variant="h4" 
        component="h1"
        gutterBottom
      >
        Login
      </Typography>
      <AuthForm mode="login" onAuth={(data) => {
        localStorage.setItem('token', data.token);
        window.location.href = '/profile';
      }} />
    </Paper>
  </Box>
);

export default Login;
