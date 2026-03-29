// src/middleware/uploadMiddleware.js
import storageService from '../services/storageService.js';
import FileHelpers from '../utils/fileHelpers.js';
import oracleConfig from '../config/oracle.js';
import { uploadSingle, uploadMultiple, uploadFields, uploadLocal } from '../config/multer.js';

// ==================== UPLOAD HANDLERS ====================

// Upload single file to Oracle/Local
const uploadToStorage = async (file, folder, userId, metadata = {}) => {
  if (!file) return null;
  
  const objectName = oracleConfig.generateObjectName(folder, userId, file.originalname);
  
  const result = await storageService.uploadToStorage(
    file.buffer,
    objectName,
    file.mimetype,
    {
      'user-id': userId.toString(),
      'original-name': file.originalname,
      'file-size': file.size.toString(),
      ...metadata
    }
  );
  
  return result;
};

// Upload profile picture
export const uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }
    
    const userId = req.user?._id || req.params.id || req.params.studentId || 'temp';
    const result = await uploadToStorage(req.file, oracleConfig.folders.profile, userId, {
      'document-type': 'profile'
    });
    
    if (result.success) {
      req.fileUrl = result.url;
      req.fileObjectName = result.objectName;
      req.uploadSuccess = true;
      req.uploadResult = result;
      console.log(`✅ Profile picture uploaded: ${result.objectName}`);
    } else {
      req.uploadError = result.error;
      console.error(`❌ Profile upload failed: ${result.error}`);
    }
    
    next();
  } catch (error) {
    console.error('Upload profile error:', error);
    req.uploadError = error.message;
    next(error);
  }
};

// Upload certificate
export const uploadCertificate = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }
    
    const studentId = req.params.studentId || req.body.studentId || req.user?._id;
    const certificateId = req.params.certificateId || req.body.certificateId;
    
    const result = await uploadToStorage(req.file, oracleConfig.folders.certificate, studentId, {
      'document-type': 'certificate',
      'certificate-id': certificateId || ''
    });
    
    if (result.success) {
      req.fileUrl = result.url;
      req.fileObjectName = result.objectName;
      req.uploadSuccess = true;
      req.uploadResult = result;
      console.log(`✅ Certificate uploaded: ${result.objectName}`);
    } else {
      req.uploadError = result.error;
      console.error(`❌ Certificate upload failed: ${result.error}`);
    }
    
    next();
  } catch (error) {
    console.error('Upload certificate error:', error);
    req.uploadError = error.message;
    next(error);
  }
};

// Upload document (single file)
export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }
    
    const studentId = req.params.studentId || req.body.studentId || req.user?._id;
    const docType = req.body.docType || req.query.docType || req.params.docType || 'document';
    
    console.log(`📄 Uploading ${docType} for student: ${studentId}`);
    
    let folder;
    switch(docType) {
      case 'marksheet':
      case 'tenthMarksheet':
      case 'twelfthMarksheet':
        folder = oracleConfig.folders.marksheet;
        break;
      case 'aadhar':
      case 'aadharCard':
        folder = oracleConfig.folders.aadhar;
        break;
      case 'photo':
      case 'profileImage':
        folder = oracleConfig.folders.profile;
        break;
      case 'certificate':
        folder = oracleConfig.folders.certificate;
        break;
      case 'transferCertificate':
      case 'casteCertificate':
        folder = oracleConfig.folders.document;
        break;
      default:
        folder = oracleConfig.folders.document;
    }
    
    const result = await uploadToStorage(req.file, folder, studentId, {
      'document-type': docType,
      'student-id': studentId.toString()
    });
    
    if (result.success) {
      req.fileUrl = result.url;
      req.fileObjectName = result.objectName;
      req.docType = docType;
      req.uploadSuccess = true;
      req.uploadResult = result;
      console.log(`✅ ${docType} uploaded: ${result.objectName}`);
    } else {
      req.uploadError = result.error;
      console.error(`❌ ${docType} upload failed: ${result.error}`);
    }
    
    next();
  } catch (error) {
    console.error('Upload document error:', error);
    req.uploadError = error.message;
    next(error);
  }
};

// Upload multiple documents
export const uploadMultipleDocuments = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next();
    }
    
    const studentId = req.params.studentId || req.body.studentId || req.user?._id;
    const uploadResults = [];
    
    console.log(`📦 Uploading ${req.files.length} documents for student: ${studentId}`);
    
    for (const file of req.files) {
      const docType = file.fieldname;
      
      let folder;
      switch(docType) {
        case 'marksheet':
        case 'tenthMarksheet':
        case 'twelfthMarksheet':
          folder = oracleConfig.folders.marksheet;
          break;
        case 'aadharCard':
        case 'aadhar':
          folder = oracleConfig.folders.aadhar;
          break;
        case 'photo':
        case 'profileImage':
          folder = oracleConfig.folders.profile;
          break;
        case 'transferCertificate':
        case 'casteCertificate':
          folder = oracleConfig.folders.document;
          break;
        default:
          folder = oracleConfig.folders.document;
      }
      
      const result = await uploadToStorage(file, folder, studentId, {
        'document-type': docType,
        'student-id': studentId.toString()
      });
      
      uploadResults.push({
        field: docType,
        originalName: file.originalname,
        fileSize: FileHelpers.formatFileSize(file.size),
        success: result.success,
        url: result.success ? result.url : null,
        objectName: result.success ? result.objectName : null,
        error: result.success ? null : result.error
      });
    }
    
    req.multipleUploadResults = uploadResults;
    req.uploadSuccess = uploadResults.some(r => r.success);
    
    const successCount = uploadResults.filter(r => r.success).length;
    const failCount = uploadResults.filter(r => !r.success).length;
    console.log(`✅ Upload complete: ${successCount} success, ${failCount} failed`);
    
    next();
  } catch (error) {
    console.error('Upload multiple documents error:', error);
    req.uploadError = error.message;
    next(error);
  }
};

// ==================== VALIDATION FUNCTIONS ====================

export const validateFile = (req, res, next) => {
  if (!req.file && !req.files) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }
  
  if (req.file) {
    const docType = req.body.docType || req.query.docType || req.params.docType || 
                    (req.file.fieldname === 'profileImage' ? 'profileImage' : 'document');
    const validation = validateSingleFile(req.file, docType);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }
  }
  
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const validation = validateSingleFile(file, file.fieldname);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: `File ${file.originalname}: ${validation.error}`
        });
      }
    }
  }
  
  next();
};

const validateSingleFile = (file, docType) => {
  const maxSize = getMaxFileSize(docType);
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size should be less than ${FileHelpers.formatFileSize(maxSize)}`
    };
  }
  
  const allowedTypes = getAllowedTypes(docType);
  
  if (!allowedTypes.includes(file.mimetype)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`
    };
  }
  
  return { valid: true };
};

export const getMaxFileSize = (docType) => {
  const sizes = {
    photo: 2 * 1024 * 1024,
    profileImage: 2 * 1024 * 1024,
    aadharCard: 2 * 1024 * 1024,
    aadhar: 2 * 1024 * 1024,
    tenthMarksheet: 5 * 1024 * 1024,
    twelfthMarksheet: 5 * 1024 * 1024,
    marksheet: 5 * 1024 * 1024,
    transferCertificate: 10 * 1024 * 1024,
    casteCertificate: 10 * 1024 * 1024,
    certificate: 5 * 1024 * 1024,
    document: 10 * 1024 * 1024
  };
  
  return sizes[docType] || 5 * 1024 * 1024;
};

export const getAllowedTypes = (docType) => {
  const imageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  const documentTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  
  const types = {
    photo: imageTypes,
    profileImage: imageTypes,
    aadharCard: documentTypes,
    aadhar: documentTypes,
    tenthMarksheet: documentTypes,
    twelfthMarksheet: documentTypes,
    marksheet: documentTypes,
    transferCertificate: documentTypes,
    casteCertificate: documentTypes,
    certificate: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
  };
  
  return types[docType] || documentTypes;
};

// ==================== ERROR HANDLERS ====================

export const handleUploadError = (err, req, res, next) => {
  if (err) {
    console.error('Upload error:', err);
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload failed'
    });
  }
  next();
};

// ==================== RESPONSE HANDLERS ====================

export const attachUploadInfo = (req, res, next) => {
  if (req.uploadSuccess) {
    res.locals.uploadInfo = {
      fileUrl: req.fileUrl,
      objectName: req.fileObjectName,
      docType: req.docType,
      uploadResult: req.uploadResult,
      multipleResults: req.multipleUploadResults
    };
  }
  next();
};

// ==================== MIDDLEWARE COMPOSITION ====================

export const uploadStudentDocument = (fieldName, docType) => {
  return [
    uploadSingle(fieldName),
    validateFile,
    uploadDocument,
    attachUploadInfo,
    handleUploadError
  ];
};

export const uploadStudentDocuments = (fields) => {
  return [
    uploadMultiple(fields),
    validateFile,
    uploadMultipleDocuments,
    attachUploadInfo,
    handleUploadError
  ];
};

// ==================== FILE MANAGEMENT HELPERS ====================

export const getFileUrl = async (objectName, temporary = false, expiryMinutes = 60) => {
  if (temporary) {
    return await storageService.getPreAuthenticatedUrl(objectName, expiryMinutes);
  }
  return { success: true, url: storageService.getFileUrl(objectName) };
};

export const deleteFile = async (objectName) => {
  return await storageService.deleteFromStorage(objectName);
};

export const getFileMetadata = async (objectName) => {
  return await storageService.getFileMetadata(objectName);
};

// ==================== RE-EXPORT MULTER FUNCTIONS ====================
// Simply re-export the imported functions - no redeclaration
export { uploadSingle, uploadMultiple, uploadFields, uploadLocal };

// ==================== DEFAULT EXPORT ====================
export default {
  uploadProfilePicture,
  uploadCertificate,
  uploadDocument,
  uploadMultipleDocuments,
  validateFile,
  handleUploadError,
  attachUploadInfo,
  uploadStudentDocument,
  uploadStudentDocuments,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  uploadLocal,
  getMaxFileSize,
  getAllowedTypes,
  getFileUrl,
  deleteFile,
  getFileMetadata
};