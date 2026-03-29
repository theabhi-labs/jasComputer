// src/constants/messages.js

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  REGISTER_SUCCESS: 'Registration successful',
  LOGOUT_SUCCESS: 'Logout successful',
  PASSWORD_CHANGED: 'Password changed successfully',
  PASSWORD_RESET: 'Password reset successful',
  EMAIL_VERIFIED: 'Email verified successfully',
  OTP_SENT: 'OTP sent successfully',
  DATA_FETCHED: 'Data fetched successfully',
  DATA_CREATED: 'Data created successfully',
  DATA_UPDATED: 'Data updated successfully',
  DATA_DELETED: 'Data deleted successfully',
  PAYMENT_SUCCESS: 'Payment successful',
  CERTIFICATE_GENERATED: 'Certificate generated successfully'
};

// Error messages
export const ERROR_MESSAGES = {
  SERVER_ERROR: 'Internal server error',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_EXISTS: 'User already exists',
  USER_NOT_FOUND: 'User not found',
  INVALID_TOKEN: 'Invalid or expired token',
  INVALID_OTP: 'Invalid or expired OTP',
  PASSWORD_MISMATCH: 'Current password is incorrect',
  EMAIL_NOT_VERIFIED: 'Email not verified',
  PAYMENT_FAILED: 'Payment failed',
  FILE_UPLOAD_ERROR: 'File upload failed',
  INVALID_FILE_TYPE: 'Invalid file type'
};

// Combined export
export const MESSAGES = {
  SUCCESS: SUCCESS_MESSAGES,
  ERROR: ERROR_MESSAGES
};

// Default export
export default MESSAGES;