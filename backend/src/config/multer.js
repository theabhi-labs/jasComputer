import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import oracleConfig from './oracle.js';
import FileHelpers from '../utils/fileHelpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Local upload directory (fallback)
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = [
    'profiles',
    'certificates', 
    'documents',
    'marksheets',
    'aadhar',
    'temp'
  ];
  
  dirs.forEach(dir => {
    const dirPath = path.join(UPLOAD_DIR, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
};

createUploadDirs();

// ==================== STORAGE CONFIGURATIONS ====================

// Disk storage (local fallback)
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'documents';
    
    // Determine folder based on fieldname
    if (file.fieldname === 'profileImage' || file.fieldname === 'profile' || file.fieldname === 'photo') {
      folder = 'profiles';
    } else if (file.fieldname === 'certificate') {
      folder = 'certificates';
    } else if (file.fieldname === 'marksheet' || file.fieldname === 'tenthMarksheet' || file.fieldname === 'twelfthMarksheet') {
      folder = 'marksheets';
    } else if (file.fieldname === 'aadharCard' || file.fieldname === 'aadhar') {
      folder = 'aadhar';
    } else if (file.fieldname === 'transferCertificate') {
      folder = 'documents';
    } else if (file.fieldname === 'casteCertificate') {
      folder = 'documents';
    }
    
    const uploadPath = path.join(UPLOAD_DIR, folder);
    cb(null, uploadPath);
  },
  
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
    cb(null, `${file.fieldname}-${baseName}-${uniqueSuffix}${ext}`);
  }
});

// Memory storage (for Oracle Cloud upload)
const memoryStorage = multer.memoryStorage();

// ==================== FILE VALIDATION ====================

// Get allowed file types based on fieldname
const getAllowedTypes = (fieldname) => {
  const imageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  const documentTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  
  const typeMap = {
    profileImage: imageTypes,
    profile: imageTypes,
    photo: imageTypes,
    certificate: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
    marksheet: documentTypes,
    tenthMarksheet: documentTypes,
    twelfthMarksheet: documentTypes,
    aadharCard: documentTypes,
    aadhar: documentTypes,
    transferCertificate: documentTypes,
    casteCertificate: documentTypes,
    document: documentTypes
  };
  
  return typeMap[fieldname] || documentTypes;
};

// Get max file size based on fieldname
const getMaxFileSize = (fieldname) => {
  const sizeMap = {
    profileImage: 2 * 1024 * 1024,      // 2MB
    profile: 2 * 1024 * 1024,            // 2MB
    photo: 2 * 1024 * 1024,              // 2MB
    certificate: 5 * 1024 * 1024,        // 5MB
    marksheet: 5 * 1024 * 1024,          // 5MB
    tenthMarksheet: 5 * 1024 * 1024,     // 5MB
    twelfthMarksheet: 5 * 1024 * 1024,   // 5MB
    aadharCard: 2 * 1024 * 1024,         // 2MB
    aadhar: 2 * 1024 * 1024,             // 2MB
    transferCertificate: 10 * 1024 * 1024, // 10MB
    casteCertificate: 10 * 1024 * 1024,    // 10MB
    document: 10 * 1024 * 1024           // 10MB default
  };
  
  return sizeMap[fieldname] || 5 * 1024 * 1024;
};

// Enhanced file filter with better validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = getAllowedTypes(file.fieldname);
  const maxSize = getMaxFileSize(file.fieldname);
  
  // Store max size in request for later use
  req.fileMaxSize = maxSize;
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type for ${file.fieldname}. Allowed: ${allowedTypes.join(', ')}`), false);
  }
};

// ==================== MULTER INSTANCES ====================

// Create multer instance with memory storage (for Oracle Cloud)
const upload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB default
    files: 10 // Max 10 files
  },
  fileFilter: fileFilter
});

// Create multer instance with disk storage (local fallback)
const uploadLocal = multer({
  storage: diskStorage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 10
  },
  fileFilter: fileFilter
});

// ==================== UPLOAD MIDDLEWARE ====================

// Single file upload with enhanced error handling
const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    const maxSize = getMaxFileSize(fieldName);
    
    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              message: `File too large for ${fieldName}. Maximum size is ${FileHelpers.formatFileSize(maxSize)}`
            });
          }
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
              success: false,
              message: `Unexpected field. Only '${fieldName}' is allowed`
            });
          }
          return res.status(400).json({
            success: false,
            message: err.message
          });
        } else if (err) {
          return res.status(400).json({
            success: false,
            message: err.message
          });
        }
      }
      
      // Store file info in request for later use
      if (req.file) {
        req.fileInfo = {
          fieldname: req.file.fieldname,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          buffer: req.file.buffer,
          maxSize: maxSize
        };
      }
      
      next();
    });
  };
};

// Multiple files upload (same field)
const uploadMultiple = (fieldName, maxCount = 5) => {
  return (req, res, next) => {
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
              success: false,
              message: `Too many files. Maximum ${maxCount} files allowed`
            });
          }
          return res.status(400).json({
            success: false,
            message: err.message
          });
        } else if (err) {
          return res.status(400).json({
            success: false,
            message: err.message
          });
        }
      }
      
      // Store files info
      if (req.files && req.files.length) {
        req.filesInfo = req.files.map(file => ({
          fieldname: file.fieldname,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          buffer: file.buffer,
          maxSize: getMaxFileSize(file.fieldname)
        }));
      }
      
      next();
    });
  };
};

// Fields upload (multiple different fields)
const uploadFields = (fields) => {
  return (req, res, next) => {
    upload.fields(fields)(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          return res.status(400).json({
            success: false,
            message: err.message
          });
        } else if (err) {
          return res.status(400).json({
            success: false,
            message: err.message
          });
        }
      }
      
      // Store files info for each field
      if (req.files) {
        req.filesInfo = {};
        Object.keys(req.files).forEach(field => {
          req.filesInfo[field] = req.files[field].map(file => ({
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            buffer: file.buffer,
            maxSize: getMaxFileSize(file.fieldname)
          }));
        });
      }
      
      next();
    });
  };
};

// ==================== DOCUMENT UPLOAD MIDDLEWARES ====================

// Upload profile picture
const uploadProfilePicture = uploadSingle('profileImage');

// Upload certificate
const uploadCertificate = uploadSingle('certificate');

// Upload student document
const uploadStudentDocument = (docType) => {
  return uploadSingle(docType);
};

// Upload multiple student documents (registration step 3)
const uploadRegistrationDocuments = uploadFields([
  { name: 'photo', maxCount: 1 },
  { name: 'aadharCard', maxCount: 1 },
  { name: 'tenthMarksheet', maxCount: 1 },
  { name: 'twelfthMarksheet', maxCount: 1 },
  { name: 'transferCertificate', maxCount: 1 },
  { name: 'casteCertificate', maxCount: 1 }
]);

// ==================== VALIDATION MIDDLEWARES ====================

// Validate file presence
const validateFile = (req, res, next) => {
  if (!req.file && (!req.files || Object.keys(req.files).length === 0)) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }
  next();
};

// Validate file size
const validateFileSize = (req, res, next) => {
  if (req.file) {
    const maxSize = getMaxFileSize(req.file.fieldname);
    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size is ${FileHelpers.formatFileSize(maxSize)}`
      });
    }
  }
  
  if (req.files) {
    const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
    for (const file of files) {
      const maxSize = getMaxFileSize(file.fieldname);
      if (file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: `File ${file.originalname} exceeds maximum size of ${FileHelpers.formatFileSize(maxSize)}`
        });
      }
    }
  }
  
  next();
};

// Validate file type
const validateFileType = (req, res, next) => {
  if (req.file) {
    const allowedTypes = getAllowedTypes(req.file.fieldname);
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`
      });
    }
  }
  
  if (req.files) {
    const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
    for (const file of files) {
      const allowedTypes = getAllowedTypes(file.fieldname);
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: `File ${file.originalname} has invalid type. Allowed: ${allowedTypes.join(', ')}`
        });
      }
    }
  }
  
  next();
};

// ==================== ERROR HANDLER ====================

// Handle multer errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

// ==================== EXPORTS ====================

export {
  upload,
  uploadLocal,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  uploadProfilePicture,
  uploadCertificate,
  uploadStudentDocument,
  uploadRegistrationDocuments,
  validateFile,
  validateFileSize,
  validateFileType,
  handleMulterError,
  getAllowedTypes,
  getMaxFileSize,
  UPLOAD_DIR
};

// Default export for convenience
export default {
  upload,
  uploadLocal,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  uploadProfilePicture,
  uploadCertificate,
  uploadStudentDocument,
  uploadRegistrationDocuments,
  validateFile,
  validateFileSize,
  validateFileType,
  handleMulterError,
  getAllowedTypes,
  getMaxFileSize,
  UPLOAD_DIR
};