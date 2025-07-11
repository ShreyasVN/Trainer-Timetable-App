// Simple form validation utilities as fallback for react-hook-form + yup

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Invalid email';
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
};

export const validateName = (name) => {
  if (!name) return 'Name is required';
  if (name.length < 2) return 'Name must be at least 2 characters';
  return null;
};

export const validateRole = (role) => {
  if (!role) return 'Role is required';
  return null;
};

export const validateForm = (formData, fields) => {
  const errors = {};
  
  if (fields.includes('email')) {
    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;
  }
  
  if (fields.includes('password')) {
    const passwordError = validatePassword(formData.password);
    if (passwordError) errors.password = passwordError;
  }
  
  if (fields.includes('name')) {
    const nameError = validateName(formData.name);
    if (nameError) errors.name = nameError;
  }
  
  if (fields.includes('role')) {
    const roleError = validateRole(formData.role);
    if (roleError) errors.role = roleError;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
