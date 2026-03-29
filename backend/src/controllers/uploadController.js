import { uploadSingle, uploadMultiple, uploadFields, uploadLocal } from '../config/multer.js';
import storageService from '../services/storageService.js';
import FileHelpers from '../utils/fileHelpers.js';
import oracleConfig from '../config/oracle.js';

// ==================== UPLOAD HANDLERS ====================

// Upload single file to Oracle
const uploadToOracle = async (file, folder, userId, metadata = {}) => {
  if (!file) return null;
  
  const objectName = oracleConfig.generateObjectName(folder, userId, file.originalname);
  
  const result = await storageService.uploadToOracle(
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
    const result = await uploadToOracle(req.file, oracleConfig.folders.profile, userId, {
      'document-type': 'profile'
    });
    
    if (result.success) {
      req.fileUrl = result.url;
      req.fileObjectName = result.objectName;
      req.uploadSuccess = true;
      console.log(`✅ Profile picture uploaded to Oracle: ${result.objectName}`);
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
    
    const result = await uploadToOracle(req.file, oracleConfig.folders.certificate, studentId, {
      'document-type': 'certificate',
      'certificate-id': certificateId || ''
    });
    
    if (result.success) {
      req.fileUrl = result.url;
      req.fileObjectName = result.objectName;
      req.uploadSuccess = true;
      console.log(`✅ Certificate uploaded to Oracle: ${result.objectName}`);
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
    const docType = req.body.docType || req.query.docType || 'document';
    
    // Determine folder based on document type
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
      default:
        folder = oracleConfig.folders.document;
    }
    
    const result = await uploadToOracle(req.file, folder, studentId, {
      'document-type': docType,
      'student-id': studentId.toString()
    });
    
    if (result.success) {
      req.fileUrl = result.url;
      req.fileObjectName = result.objectName;
      req.docType = docType;
      req.uploadSuccess = true;
      console.log(`✅ ${docType} uploaded to Oracle: ${result.objectName}`);
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
    
    for (const file of req.files) {
      const docType = file.fieldname;
      
      // Determine folder
      let folder;
      switch(docType) {
        case 'marksheet':
        case 'tenthMarksheet':
          folder = oracleConfig.folders.marksheet;
          break;
        case 'aadharCard':
          folder = oracleConfig.folders.aadhar;
          break;
        case 'photo':
        case 'profileImage':
          folder = oracleConfig.folders.profile;
          break;
        default:
          folder = oracleConfig.folders.document;
      }
      
      const result = await uploadToOracle(file, folder, studentId, {
        'document-type': docType,
        'student-id': studentId.toString()
      });
      
      uploadResults.push({
        field: docType,
        originalName: file.originalname,
        success: result.success,
        url: result.success ? result.url : null,
        objectName: result.success ? result.objectName : null,
        error: result.success ? null : result.error
      });
    }
    
    req.multipleUploadResults = uploadResults;
    req.uploadSuccess = uploadResults.some(r => r.success);
    
    next();
  } catch (error) {
    console.error('Upload multiple documents error:', error);
    req.uploadError = error.message;
    next(error);
  }
};

// ==================== VALIDATION FUNCTIONS ====================

// Validate file before upload
export const validateFile = (req, res, next) => {
  if (!req.file && !req.files) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }
  
  // Validate single file
  if (req.file) {
    const validation = validateSingleFile(req.file, req.body.docType);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }
  }
  
  // Validate multiple files
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

// Validate single file
const validateSingleFile = (file, docType) => {
  // Get max size based on document type
  const maxSize = getMaxFileSize(docType);
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size should be less than ${FileHelpers.formatFileSize(maxSize)}`
    };
  }
  
  // Get allowed types based on document type
  const allowedTypes = getAllowedTypes(docType);
  
  if (!allowedTypes.includes(file.mimetype)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`
    };
  }
  
  return { valid: true };
};

// Get max file size based on document type
const getMaxFileSize = (docType) => {
  const sizes = {
    photo: 2 * 1024 * 1024,           // 2MB
    profileImage: 2 * 1024 * 1024,     // 2MB
    aadharCard: 2 * 1024 * 1024,       // 2MB
    aadhar: 2 * 1024 * 1024,           // 2MB
    tenthMarksheet: 5 * 1024 * 1024,   // 5MB
    twelfthMarksheet: 5 * 1024 * 1024, // 5MB
    marksheet: 5 * 1024 * 1024,        // 5MB
    transferCertificate: 10 * 1024 * 1024, // 10MB
    casteCertificate: 10 * 1024 * 1024,    // 10MB
    certificate: 5 * 1024 * 1024,      // 5MB
    document: 10 * 1024 * 1024         // 10MB default
  };
  
  return sizes[docType] || 5 * 1024 * 1024;
};

// Get allowed file types based on document type
const getAllowedTypes = (docType) => {
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

// Handle upload errors
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

// Add uploaded file info to response
export const attachUploadInfo = (req, res, next) => {
  if (req.uploadSuccess) {
    res.uploadInfo = {
      fileUrl: req.fileUrl,
      objectName: req.fileObjectName,
      docType: req.docType,
      multipleResults: req.multipleUploadResults
    };
  }
  next();
};


// ==================== MIDDLEWARE COMPOSITION ====================

// Create middleware chain for document upload
export const uploadStudentDocument = (fieldName, docType) => {
  return [
    uploadSingle(fieldName),
    validateFile,
    uploadDocument,
    attachUploadInfo,
    handleUploadError
  ];
};

// Create middleware chain for multiple documents upload
export const uploadStudentDocuments = (fields) => {
  return [
    uploadMultiple(fields),
    validateFile,
    uploadMultipleDocuments,
    attachUploadInfo,
    handleUploadError
  ];
};


// Add these methods to UploadController class

// Get file URL
export const getFileUrl = async (req, res) => {
  try {
    const { objectName } = req.params;
    const { temporary, expiryMinutes = 60 } = req.query;
    
    console.log('🔗 Getting file URL:', { objectName, temporary, expiryMinutes });
    
    // Validate object name
    if (!objectName) {
      return this.error(res, 'Object name is required', 400);
    }
    
    // Check if file exists in Oracle Cloud
    const exists = await storageService.fileExists(objectName);
    if (!exists) {
      return this.error(res, 'File not found in Oracle Cloud', 404);
    }
    
    let url;
    let metadata = null;
    
    if (temporary === 'true' || temporary === true) {
      // Generate temporary pre-authenticated URL
      const result = await storageService.getPreAuthenticatedUrl(
        objectName, 
        parseInt(expiryMinutes),
        'ObjectRead'
      );
      
      if (!result.success) {
        return this.error(res, result.error, 500);
      }
      
      url = result.url;
      
      return this.success(res, {
        url,
        objectName,
        temporary: true,
        expiresIn: `${expiryMinutes} minutes`,
        expiresAt: result.expiresAt,
        accessType: 'temporary'
      }, 'Temporary file URL generated successfully');
      
    } else {
      // Get direct URL (public or authenticated)
      url = storageService.getFileUrl(objectName);
      
      // Get file metadata if available
      const metadataResult = await storageService.getFileMetadata(objectName);
      if (metadataResult.success) {
        metadata = metadataResult.metadata;
      }
      
      return this.success(res, {
        url,
        objectName,
        temporary: false,
        accessType: 'direct',
        metadata: metadata ? {
          contentType: metadata.contentType,
          contentLength: metadata.contentLength,
          lastModified: metadata.lastModified,
          etag: metadata.etag
        } : null
      }, 'File URL retrieved successfully');
    }
    
  } catch (error) {
    console.error('Get file URL error:', error);
    return this.error(res, error.message || 'Failed to get file URL', 500);
  }
};

// Get temporary file URL (alias for getFileUrl with temporary=true)
export const getTemporaryFileUrl = async (req, res) => {
  try {
    const { objectName } = req.params;
    const { expiryMinutes = 60 } = req.query;
    
    console.log('🔗 Getting temporary file URL:', { objectName, expiryMinutes });
    
    if (!objectName) {
      return this.error(res, 'Object name is required', 400);
    }
    
    const exists = await storageService.fileExists(objectName);
    if (!exists) {
      return this.error(res, 'File not found in Oracle Cloud', 404);
    }
    
    const result = await storageService.getPreAuthenticatedUrl(
      objectName, 
      parseInt(expiryMinutes),
      'ObjectRead'
    );
    
    if (!result.success) {
      return this.error(res, result.error, 500);
    }
    
    return this.success(res, {
      url: result.url,
      objectName,
      expiresIn: `${expiryMinutes} minutes`,
      expiresAt: result.expiresAt,
      accessType: 'temporary'
    }, 'Temporary file URL generated successfully');
    
  } catch (error) {
    console.error('Get temporary file URL error:', error);
    return this.error(res, error.message, 500);
  }
};

// Get file metadata
export const getFileMetadata = async (req, res) => {
  try {
    const { objectName } = req.params;
    
    console.log('📄 Getting file metadata:', objectName);
    
    if (!objectName) {
      return this.error(res, 'Object name is required', 400);
    }
    
    const exists = await storageService.fileExists(objectName);
    if (!exists) {
      return this.error(res, 'File not found in Oracle Cloud', 404);
    }
    
    const result = await storageService.getFileMetadata(objectName);
    
    if (!result.success) {
      return this.error(res, result.error, 500);
    }
    
    return this.success(res, {
      objectName,
      metadata: {
        etag: result.metadata.etag,
        contentType: result.metadata.contentType,
        contentLength: result.metadata.contentLength,
        contentLengthFormatted: FileHelpers.formatFileSize(result.metadata.contentLength),
        lastModified: result.metadata.lastModified,
        metadata: result.metadata.metadata
      }
    }, 'File metadata retrieved successfully');
    
  } catch (error) {
    console.error('Get file metadata error:', error);
    return this.error(res, error.message, 500);
  }
};

// Download file
export const downloadFile = async (req, res) => {
  try {
    const { objectName } = req.params;
    
    console.log('📥 Downloading file:', objectName);
    
    if (!objectName) {
      return this.error(res, 'Object name is required', 400);
    }
    
    const exists = await storageService.fileExists(objectName);
    if (!exists) {
      return this.error(res, 'File not found in Oracle Cloud', 404);
    }
    
    // Get file metadata for content type
    const metadata = await storageService.getFileMetadata(objectName);
    
    // Generate temporary URL for download
    const result = await storageService.getPreAuthenticatedUrl(
      objectName, 
      15, // 15 minutes for download
      'ObjectRead'
    );
    
    if (!result.success) {
      return this.error(res, result.error, 500);
    }
    
    // Get filename from object name
    const fileName = objectName.split('/').pop();
    
    return this.success(res, {
      downloadUrl: result.url,
      objectName,
      fileName,
      contentType: metadata.success ? metadata.metadata.contentType : 'application/octet-stream',
      expiresIn: '15 minutes',
      expiresAt: result.expiresAt
    }, 'Download URL generated successfully');
    
  } catch (error) {
    console.error('Download file error:', error);
    return this.error(res, error.message, 500);
  }
};

// Get file info (combines metadata and URL)
export const getFileInfo = async (req, res) => {
  try {
    const { objectName } = req.params;
    
    console.log('ℹ️ Getting file info:', objectName);
    
    if (!objectName) {
      return this.error(res, 'Object name is required', 400);
    }
    
    const exists = await storageService.fileExists(objectName);
    if (!exists) {
      return this.error(res, 'File not found in Oracle Cloud', 404);
    }
    
    // Get file metadata
    const metadataResult = await storageService.getFileMetadata(objectName);
    
    // Get file URL
    const url = storageService.getFileUrl(objectName);
    
    // Try to find which student/user this file belongs to
    let owner = null;
    const student = await Student.findOne({
      $or: [
        { profileImageObjectName: objectName },
        { 'documents.profilePhotoObjectName': objectName },
        { 'documents.aadharCardObjectName': objectName },
        { 'documents.marksheet10thObjectName': objectName },
        { 'documents.marksheet12thObjectName': objectName },
        { 'documents.transferCertificateObjectName': objectName },
        { 'documents.casteCertificateObjectName': objectName }
      ]
    }).select('name email enrollmentId');
    
    if (student) {
      owner = {
        type: 'student',
        id: student._id,
        name: student.name,
        email: student.email,
        enrollmentId: student.enrollmentId
      };
    }
    
    return this.success(res, {
      objectName,
      url,
      exists: true,
      owner,
      metadata: metadataResult.success ? {
        contentType: metadataResult.metadata.contentType,
        contentLength: metadataResult.metadata.contentLength,
        contentLengthFormatted: FileHelpers.formatFileSize(metadataResult.metadata.contentLength),
        lastModified: metadataResult.metadata.lastModified,
        etag: metadataResult.metadata.etag,
        customMetadata: metadataResult.metadata.metadata
      } : null,
      fileInfo: {
        fileName: objectName.split('/').pop(),
        filePath: objectName,
        fileExtension: objectName.split('.').pop(),
        folder: objectName.split('/')[0]
      }
    });
    
  } catch (error) {
    console.error('Get file info error:', error);
    return this.error(res, error.message, 500);
  }
};

// List files in a folder
export const listFiles = async (req, res) => {
  try {
    const { folder } = req.params;
    const { limit = 100, start = null } = req.query;
    
    console.log('📁 Listing files in folder:', folder);
    
    if (!folder) {
      return this.error(res, 'Folder name is required', 400);
    }
    
    const result = await storageService.listObjects(folder, parseInt(limit), start);
    
    if (!result.success) {
      return this.error(res, result.error, 500);
    }
    
    // Format objects
    const objects = result.objects.map(obj => ({
      name: obj.name,
      size: obj.size,
      sizeFormatted: FileHelpers.formatFileSize(obj.size),
      etag: obj.etag,
      lastModified: obj.timeModified,
      url: storageService.getFileUrl(obj.name)
    }));
    
    return this.success(res, {
      folder,
      objects,
      count: objects.length,
      nextStartWith: result.nextStartWith,
      limit: parseInt(limit)
    });
    
  } catch (error) {
    console.error('List files error:', error);
    return this.error(res, error.message, 500);
  }
};

// src/controllers/uploadController.js

// Add this method to UploadController class

// Delete file from storage
const deleteFile = async (req, res) => {
  try {
    const { objectName } = req.params;
    
    console.log('🗑️ Deleting file:', objectName);
    
    if (!objectName) {
      return this.error(res, 'Object name is required', 400);
    }
    
    // Check if file exists
    const exists = await storageService.fileExists(objectName);
    if (!exists) {
      return this.error(res, 'File not found', 404);
    }
    
    // Delete from storage
    const result = await storageService.deleteFromStorage(objectName);
    
    if (!result.success) {
      return this.error(res, result.error, 500);
    }
    
    // Also remove reference from database
    // Find and clear the document reference
    const student = await Student.findOne({
      $or: [
        { profileImageObjectName: objectName },
        { 'documents.profilePhotoObjectName': objectName },
        { 'documents.aadharCardObjectName': objectName },
        { 'documents.marksheet10thObjectName': objectName },
        { 'documents.marksheet12thObjectName': objectName },
        { 'documents.transferCertificateObjectName': objectName },
        { 'documents.casteCertificateObjectName': objectName }
      ]
    });
    
    if (student) {
      // Clear the specific field
      const updateFields = {};
      if (student.profileImageObjectName === objectName) {
        updateFields.profileImage = '';
        updateFields.profileImageObjectName = '';
      }
      if (student.documents?.profilePhotoObjectName === objectName) {
        updateFields['documents.profilePhoto'] = '';
        updateFields['documents.profilePhotoObjectName'] = '';
      }
      if (student.documents?.aadharCardObjectName === objectName) {
        updateFields['documents.aadharCard'] = '';
        updateFields['documents.aadharCardObjectName'] = '';
      }
      if (student.documents?.marksheet10thObjectName === objectName) {
        updateFields['documents.marksheet10th'] = '';
        updateFields['documents.marksheet10thObjectName'] = '';
      }
      if (student.documents?.marksheet12thObjectName === objectName) {
        updateFields['documents.marksheet12th'] = '';
        updateFields['documents.marksheet12thObjectName'] = '';
      }
      if (student.documents?.transferCertificateObjectName === objectName) {
        updateFields['documents.transferCertificate'] = '';
        updateFields['documents.transferCertificateObjectName'] = '';
      }
      if (student.documents?.casteCertificateObjectName === objectName) {
        updateFields['documents.casteCertificate'] = '';
        updateFields['documents.casteCertificateObjectName'] = '';
      }
      
      if (Object.keys(updateFields).length > 0) {
        await Student.findByIdAndUpdate(student._id, updateFields);
      }
    }
    
    return this.success(res, {
      objectName,
      deleted: true,
      timestamp: new Date().toISOString()
    }, 'File deleted successfully');
    
  } catch (error) {
    console.error('Delete file error:', error);
    return this.error(res, error.message || 'Failed to delete file', 500);
  }
};

// ==================== EXPORTS ====================

export {
  uploadSingle,
  uploadMultiple,
  uploadFields,
  uploadLocal,
  validateSingleFile,
  getMaxFileSize,
  getAllowedTypes
};

// Default export for convenience
export default {
  uploadProfilePicture,
  deleteFile,
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
  uploadLocal
};