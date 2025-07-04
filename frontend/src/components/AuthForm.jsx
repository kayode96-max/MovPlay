import { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import API from '../api';
import { useFormValidation, validationRules } from '../hooks/useFormValidation';
import { useNotifications } from './NotificationProvider';

const AuthForm = ({ mode = 'login', onAuth }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { showSuccess, showError } = useNotifications();

  // Validation schema
  const validationSchema = {
    email: [validationRules.required, validationRules.email],
    password: [
      validationRules.required,
      validationRules.minLength(6),
      ...(mode === 'register' ? [validationRules.password] : [])
    ],
    ...(mode === 'register' && {
      username: [
        validationRules.required,
        validationRules.minLength(3),
        validationRules.maxLength(20)
      ]
    })
  };

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleSubmit,
    getFieldProps,
    isValid
  } = useFormValidation(validationSchema, {
    email: '',
    password: '',
    username: ''
  });

  const submitForm = async (formValues) => {
    try {
      const endpoint = mode === 'register' ? '/auth/register' : '/auth/login';
      const payload = mode === 'register' 
        ? formValues 
        : { email: formValues.email, password: formValues.password };
      
      const { data } = await API.post(endpoint, payload);
      
      showSuccess(
        mode === 'register' 
          ? 'Account created successfully!' 
          : 'Welcome back!'
      );
      
      onAuth(data);
    } catch (err) {
      const message = err.response?.data?.message || 'Authentication failed';
      showError(message);
    }
  };

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit(submitForm)} 
      sx={{ 
        mt: 2, 
        width: '100%', 
        maxWidth: 400, 
        mx: 'auto', 
        p: 3, 
        bgcolor: '#161b22', 
        borderRadius: 3, 
        boxShadow: 2 
      }}
      role="form"
      aria-label={mode === 'register' ? 'Create account form' : 'Sign in form'}
    >
      <Typography 
        variant="h5" 
        mb={2} 
        fontWeight={700} 
        align="center"
        component="h1"
      >
        {mode === 'register' ? 'Create Account' : 'Sign In'}
      </Typography>
      
      {mode === 'register' && (
        <TextField
          {...getFieldProps('username')}
          label="Username"
          name="username"
          autoComplete="username"
          fullWidth
          margin="normal"
          required
          aria-describedby={errors.username ? 'username-error' : undefined}
          inputProps={{
            'aria-label': 'Username',
            minLength: 3,
            maxLength: 20
          }}
        />
      )}
      
      <TextField
        {...getFieldProps('email')}
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        fullWidth
        margin="normal"
        required
        aria-describedby={errors.email ? 'email-error' : undefined}
        inputProps={{
          'aria-label': 'Email address'
        }}
      />
      
      <TextField
        {...getFieldProps('password')}
        label="Password"
        name="password"
        type={showPassword ? 'text' : 'password'}
        autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
        fullWidth
        margin="normal"
        required
        aria-describedby={errors.password ? 'password-error' : 'password-help'}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          )
        }}
        inputProps={{
          'aria-label': 'Password',
          minLength: 6
        }}
      />
      
      {mode === 'register' && (
        <Typography 
          id="password-help"
          variant="caption" 
          color="text.secondary"
          sx={{ display: 'block', mt: 1, mb: 2 }}
        >
          Password must contain at least 6 characters, including uppercase, lowercase, and number
        </Typography>
      )}

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={isSubmitting || !isValid}
        sx={{ 
          mt: 3, 
          py: 1.2, 
          fontWeight: 600, 
          fontSize: '1.1em',
          '&:disabled': {
            opacity: 0.6
          }
        }}
        aria-describedby="submit-status"
      >
        {isSubmitting ? 'Please wait...' : mode === 'register' ? 'Create Account' : 'Sign In'}
      </Button>
      
      <div id="submit-status" className="sr-only" aria-live="polite">
        {isSubmitting ? 'Processing your request...' : ''}
      </div>
    </Box>
  );
};

export default AuthForm;
