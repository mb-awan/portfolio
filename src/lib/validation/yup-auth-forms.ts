import * as yup from 'yup';

export const signInFormSchema = yup.object({
  email: yup.string().email('Enter a valid email').max(255, 'Email is too long').required('Email is required'),
  password: yup.string().min(1, 'Password is required').required('Password is required'),
});

export const signUpFormSchema = yup.object({
  email: yup.string().email('Enter a valid email').max(255, 'Email is too long').required('Email is required'),
  name: yup.string().min(1, 'Name is required').max(120, 'Name is too long').required('Name is required'),
  password: yup
    .string()
    .min(8, 'Use at least 8 characters')
    .max(128, 'Password is too long')
    .required('Password is required'),
});

const otp6 = yup
  .string()
  .matches(/^\d{6}$/, 'Enter the 6-digit code')
  .required('Code is required');

export const verifyEmailFormSchema = yup.object({
  email: yup.string().email('Enter a valid email').max(255).required('Email is required'),
  otp: otp6,
});

export const forgotPasswordFormSchema = yup.object({
  email: yup.string().email('Enter a valid email').max(255).required('Email is required'),
});

export const resetPasswordFormSchema = yup.object({
  newPassword: yup
    .string()
    .min(8, 'Use at least 8 characters')
    .max(128, 'Password is too long')
    .required('New password is required'),
  otp: otp6,
});

export const verifyTfaFormSchema = yup.object({
  otp: yup.string().min(6, 'Enter the code').max(10, 'Code is too long').required('Code is required'),
});
