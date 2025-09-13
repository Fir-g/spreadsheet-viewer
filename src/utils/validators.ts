import { FILE_CONFIG } from '@/config/constants';

// Validation utility functions
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateFiles = (fileList: FileList): string | null => {
  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    
    if (!FILE_CONFIG.ALLOWED_MIME_TYPES.includes(file.type)) {
      return `File "${file.name}" is not a supported format. Only PDF and XLSX files are allowed.`;
    }
    
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!FILE_CONFIG.ALLOWED_TYPES.includes(fileExtension)) {
      return `File "${file.name}" has an unsupported extension. Only .pdf and .xlsx files are allowed.`;
    }

    if (file.size > FILE_CONFIG.MAX_SIZE) {
      return `File "${file.name}" is too large. Maximum file size is 50MB.`;
    }
  }
  return null;
};

export const validateProjectName = (name: string): { isValid: boolean; error?: string } => {
  if (!name.trim()) {
    return { isValid: false, error: 'Project name is required' };
  }
  
  if (name.length < 3) {
    return { isValid: false, error: 'Project name must be at least 3 characters long' };
  }
  
  if (name.length > 100) {
    return { isValid: false, error: 'Project name must be less than 100 characters' };
  }
  
  return { isValid: true };
};

export const validateRequired = (value: string, fieldName: string): { isValid: boolean; error?: string } => {
  if (!value.trim()) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  return { isValid: true };
};