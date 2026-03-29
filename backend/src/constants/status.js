// src/constants/status.js

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended'
};

export const STUDENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  COMPLETED: 'completed',
  DROPPED: 'dropped',
  SUSPENDED: 'suspended'
};

export const FEE_STATUS = {
  PAID: 'paid',
  PENDING: 'pending',
  PARTIALLY_PAID: 'partially_paid',
  OVERDUE: 'overdue'
};

export const PAYMENT_STATUS = {
  SUCCESS: 'success',
  PENDING: 'pending',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  HOLIDAY: 'holiday'
};

export const INQUIRY_STATUS = {
  NEW: 'new',
  CONTACTED: 'contacted',
  CONVERTED: 'converted',
  LOST: 'lost'
};

export const CERTIFICATE_STATUS = {
  DRAFT: 'draft',
  ISSUED: 'issued',
  REVOKED: 'revoked'
};

// Default export
export default {
  USER_STATUS,
  STUDENT_STATUS,
  FEE_STATUS,
  PAYMENT_STATUS,
  ATTENDANCE_STATUS,
  INQUIRY_STATUS,
  CERTIFICATE_STATUS
};