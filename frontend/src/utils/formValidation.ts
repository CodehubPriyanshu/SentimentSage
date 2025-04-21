import { toast } from '@/components/ui/use-toast';

/**
 * Form validation utility
 * 
 * This utility provides functions for validating form inputs
 * and displaying appropriate error messages.
 */

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Password validation regex
const PASSWORD_REGEX = {
  minLength: 8,
  hasUppercase: /[A-Z]/,
  hasLowercase: /[a-z]/,
  hasNumber: /[0-9]/,
  hasSpecial: /[!@#$%^&*(),.?":{}|<>]/
};

// URL validation regex
const URL_REGEX = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

/**
 * Validate an email address
 * @param email The email address to validate
 * @returns An object with validation result and error message
 */
export const validateEmail = (email: string): { valid: boolean; message?: string } => {
  if (!email) {
    return { valid: false, message: 'Email is required' };
  }
  
  if (!EMAIL_REGEX.test(email)) {
    return { valid: false, message: 'Please enter a valid email address' };
  }
  
  return { valid: true };
};

/**
 * Validate a password
 * @param password The password to validate
 * @param options Optional validation options
 * @returns An object with validation result and error message
 */
export const validatePassword = (
  password: string, 
  options = { 
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecial: true,
    minLength: PASSWORD_REGEX.minLength
  }
): { valid: boolean; message?: string } => {
  if (!password) {
    return { valid: false, message: 'Password is required' };
  }
  
  if (password.length < options.minLength) {
    return { valid: false, message: `Password must be at least ${options.minLength} characters long` };
  }
  
  if (options.requireUppercase && !PASSWORD_REGEX.hasUppercase.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (options.requireLowercase && !PASSWORD_REGEX.hasLowercase.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (options.requireNumber && !PASSWORD_REGEX.hasNumber.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  if (options.requireSpecial && !PASSWORD_REGEX.hasSpecial.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }
  
  return { valid: true };
};

/**
 * Validate a URL
 * @param url The URL to validate
 * @returns An object with validation result and error message
 */
export const validateUrl = (url: string): { valid: boolean; message?: string } => {
  if (!url) {
    return { valid: false, message: 'URL is required' };
  }
  
  if (!URL_REGEX.test(url)) {
    return { valid: false, message: 'Please enter a valid URL' };
  }
  
  return { valid: true };
};

/**
 * Validate a required field
 * @param value The field value
 * @param fieldName The name of the field
 * @returns An object with validation result and error message
 */
export const validateRequired = (value: any, fieldName: string): { valid: boolean; message?: string } => {
  if (!value) {
    return { valid: false, message: `${fieldName} is required` };
  }
  
  if (typeof value === 'string' && value.trim() === '') {
    return { valid: false, message: `${fieldName} is required` };
  }
  
  return { valid: true };
};

/**
 * Validate a form field and show toast if invalid
 * @param validator The validator function to use
 * @param value The field value
 * @param showToast Whether to show a toast notification if validation fails
 * @returns True if valid, false otherwise
 */
export const validateField = (
  validator: (value: any) => { valid: boolean; message?: string },
  value: any,
  showToast = true
): boolean => {
  const result = validator(value);
  
  if (!result.valid && showToast && result.message) {
    toast({
      title: 'Validation Error',
      description: result.message,
      variant: 'destructive',
    });
  }
  
  return result.valid;
};

export default {
  email: validateEmail,
  password: validatePassword,
  url: validateUrl,
  required: validateRequired,
  validateField
};
