import { useState, useCallback } from 'react';

// Validation rules
export const validationRules = {
  required: (value, fieldName) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${fieldName} is required`;
    }
    return null;
  },

  email: (value) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  },

  minLength: (minLength) => (value, fieldName) => {
    if (!value) return null;
    if (value.length < minLength) {
      return `${fieldName} must be at least ${minLength} characters long`;
    }
    return null;
  },

  maxLength: (maxLength) => (value, fieldName) => {
    if (!value) return null;
    if (value.length > maxLength) {
      return `${fieldName} cannot exceed ${maxLength} characters`;
    }
    return null;
  },

  password: (value) => {
    if (!value) return null;
    
    const errors = [];
    if (value.length < 6) {
      errors.push('at least 6 characters');
    }
    if (!/[A-Z]/.test(value)) {
      errors.push('one uppercase letter');
    }
    if (!/[a-z]/.test(value)) {
      errors.push('one lowercase letter');
    }
    if (!/\d/.test(value)) {
      errors.push('one number');
    }
    
    if (errors.length > 0) {
      return `Password must contain ${errors.join(', ')}`;
    }
    return null;
  },

  confirmPassword: (originalPassword) => (value) => {
    if (!value) return null;
    if (value !== originalPassword) {
      return 'Passwords do not match';
    }
    return null;
  },

  rating: (value) => {
    if (value === null || value === undefined) return null;
    if (value < 0.5 || value > 10) {
      return 'Rating must be between 0.5 and 10';
    }
    return null;
  }
};

export const useFormValidation = (validationSchema, initialValues = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((fieldName, value) => {
    const fieldRules = validationSchema[fieldName];
    if (!fieldRules) return null;

    for (const rule of fieldRules) {
      const error = rule(value, fieldName);
      if (error) return error;
    }
    return null;
  }, [validationSchema]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationSchema).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validationSchema, values, validateField]);

  const handleChange = useCallback((fieldName) => (event) => {
    const value = event.target.value;
    setValues(prev => ({ ...prev, [fieldName]: value }));

    // Real-time validation for touched fields
    if (touched[fieldName]) {
      const error = validateField(fieldName, value);
      setErrors(prev => ({ ...prev, [fieldName]: error }));
    }
  }, [touched, validateField]);

  const handleBlur = useCallback((fieldName) => () => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    // Validate on blur
    const error = validateField(fieldName, values[fieldName]);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  }, [values, validateField]);

  const handleSubmit = useCallback((onSubmit) => async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    // Mark all fields as touched
    const allTouched = {};
    Object.keys(validationSchema).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    const isValid = validateForm();
    
    if (isValid) {
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }
    
    setIsSubmitting(false);
  }, [values, validateForm, validationSchema]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const setValue = useCallback((fieldName, value) => {
    setValues(prev => ({ ...prev, [fieldName]: value }));
  }, []);

  const getFieldProps = useCallback((fieldName) => ({
    value: values[fieldName] || '',
    onChange: handleChange(fieldName),
    onBlur: handleBlur(fieldName),
    error: Boolean(errors[fieldName] && touched[fieldName]),
    helperText: touched[fieldName] ? errors[fieldName] : '',
    'aria-invalid': Boolean(errors[fieldName] && touched[fieldName]),
    'aria-describedby': errors[fieldName] ? `${fieldName}-error` : undefined,
  }), [values, errors, touched, handleChange, handleBlur]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleSubmit,
    getFieldProps,
    setValue,
    reset,
    validateForm,
    isValid: Object.keys(errors).length === 0
  };
};

export default useFormValidation;
