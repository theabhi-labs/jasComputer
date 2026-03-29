// src/constants/roles.js

 const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student'
};

 const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: [
    'manage_all',
    'create_admin',
    'manage_teachers',
    'manage_students',
    'manage_courses',
    'manage_batches',
    'manage_fees',
    'manage_certificates',
    'view_all_reports'
  ],
  [ROLES.ADMIN]: [
    'manage_teachers',
    'manage_students',
    'manage_courses',
    'manage_batches',
    'manage_fees',
    'manage_certificates',
    'view_reports'
  ],
  [ROLES.TEACHER]: [
    'view_own_students',
    'mark_attendance',
    'update_marks',
    'view_own_batch'
  ],
  [ROLES.STUDENT]: [
    'view_own_profile',
    'view_own_fees',
    'view_own_attendance',
    'download_certificate'
  ]
};

// Default export
export {
    ROLES,
    ROLE_PERMISSIONS
};