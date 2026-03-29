// services/storageService.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import oracleConfig from '../config/oracle.js';
import FileHelpers from '../utils/fileHelpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class StorageService {
  constructor() {
    // Check if Oracle is configured
    this.oracleEnabled = !!(oracleConfig.objectStorage?.namespace && 
                            oracleConfig.objectStorage?.privateKey);
    
    // Setup local storage
    this.localUploadDir = path.join(__dirname, '../../uploads');
    this.setupLocalDirectories();
    
    console.log(`📦 Storage Service initialized - Oracle: ${this.oracleEnabled ? '✅ Enabled' : '❌ Disabled (using local storage)'}`);
  }
  
  // Create local directories if they don't exist
  setupLocalDirectories() {
    const dirs = ['profiles', 'documents', 'marksheets', 'aadhar', 'certificates', 'temp'];
    dirs.forEach(dir => {
      const dirPath = path.join(this.localUploadDir, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`📁 Created local directory: ${dirPath}`);
      }
    });
  }
  
  // Generate unique object name
  generateObjectName(folder, userId, originalName) {
    const timestamp = Date.now();
    const uniqueId = uuidv4().substring(0, 8);
    const extension = path.extname(originalName);
    const sanitizedName = path.basename(originalName, extension).replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
    const fileName = `${userId}_${timestamp}_${uniqueId}_${sanitizedName}${extension}`;
    return `${folder}/${fileName}`;
  }
  
  // ==================== LOCAL STORAGE METHODS ====================
  
  // Upload to local storage
  async uploadToLocal(fileBuffer, objectName, contentType, metadata = {}) {
    try {
      const localPath = path.join(this.localUploadDir, objectName);
      const dir = path.dirname(localPath);
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(localPath, fileBuffer);
      
      const url = `/uploads/${objectName}`;
      
      console.log(`✅ File saved locally: ${localPath}`);
      
      return {
        success: true,
        url: url,
        objectName: objectName,
        etag: `${Date.now()}`,
        metadata: metadata,
        storage: 'local'
      };
    } catch (error) {
      console.error('Local upload error:', error);
      return {
        success: false,
        error: error.message || 'Upload failed'
      };
    }
  }
  
  // Delete from local storage
  async deleteFromLocal(objectName) {
    try {
      const localPath = path.join(this.localUploadDir, objectName);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
        console.log(`🗑️ Deleted local file: ${localPath}`);
      }
      return {
        success: true,
        message: 'File deleted successfully',
        storage: 'local'
      };
    } catch (error) {
      console.error('Local delete error:', error);
      return {
        success: false,
        error: error.message || 'Delete failed'
      };
    }
  }
  
  // Check if file exists in local storage
  async fileExistsLocal(objectName) {
    const localPath = path.join(this.localUploadDir, objectName);
    return fs.existsSync(localPath);
  }
  
  // Get file metadata from local storage
  async getFileMetadataLocal(objectName) {
    try {
      const localPath = path.join(this.localUploadDir, objectName);
      const stats = fs.statSync(localPath);
      return {
        success: true,
        metadata: {
          etag: `${stats.mtimeMs}`,
          contentType: 'application/octet-stream',
          contentLength: stats.size,
          lastModified: stats.mtime,
          metadata: {}
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // List objects in local folder
  async listObjectsLocal(prefix = '', limit = 100) {
    try {
      const folderPath = path.join(this.localUploadDir, prefix);
      if (!fs.existsSync(folderPath)) {
        return { success: true, objects: [], nextStartWith: null };
      }
      
      const files = fs.readdirSync(folderPath);
      const objects = files.slice(0, limit).map(file => ({
        name: path.join(prefix, file),
        size: fs.statSync(path.join(folderPath, file)).size,
        timeModified: fs.statSync(path.join(folderPath, file)).mtime
      }));
      
      return {
        success: true,
        objects: objects,
        nextStartWith: files.length > limit ? files[limit] : null
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  // ==================== ORACLE STORAGE METHODS ====================
  
  // Upload to Oracle Cloud Storage
  async uploadToOracle(fileBuffer, objectName, contentType, metadata = {}) {
    try {
      // TODO: Implement actual Oracle Cloud upload when OCI SDK is installed
      // For now, log and return mock response
      console.log(`[Oracle] Would upload ${objectName} to bucket ${oracleConfig.objectStorage.bucketName}`);
      
      const fileUrl = oracleConfig.getFileUrl(objectName);
      
      // If Oracle SDK is installed, use it
      if (this.oracleEnabled && false) { // Temporarily disabled
        // const { ObjectStorageClient } = await import('oci-objectstorage');
        // const client = new ObjectStorageClient({...});
        // const response = await client.putObject({...});
      }
      
      return {
        success: true,
        url: fileUrl,
        objectName: objectName,
        bucket: oracleConfig.objectStorage.bucketName,
        region: oracleConfig.objectStorage.region,
        storage: 'oracle'
      };
      
    } catch (error) {
      console.error('Oracle upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Delete from Oracle Cloud Storage
  async deleteFromOracle(objectName) {
    try {
      console.log(`[Oracle] Would delete ${objectName}`);
      return {
        success: true,
        objectName: objectName,
        storage: 'oracle'
      };
    } catch (error) {
      console.error('Oracle delete error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Check if file exists in Oracle
  async fileExistsOracle(objectName) {
    // TODO: Implement actual check
    return false;
  }
  
  // Get file metadata from Oracle
  async getFileMetadataOracle(objectName) {
    // TODO: Implement actual metadata fetch
    return {
      success: false,
      error: 'Not implemented'
    };
  }
  
  // ==================== UNIFIED METHODS (Auto switch between Oracle/Local) ====================
  
  // Upload file to storage (auto-select based on config)
  async uploadToStorage(fileBuffer, objectName, contentType, metadata = {}) {
    if (this.oracleEnabled) {
      return await this.uploadToOracle(fileBuffer, objectName, contentType, metadata);
    } else {
      return await this.uploadToLocal(fileBuffer, objectName, contentType, metadata);
    }
  }
  
  // Delete from storage
  async deleteFromStorage(objectName) {
    if (this.oracleEnabled) {
      return await this.deleteFromOracle(objectName);
    } else {
      return await this.deleteFromLocal(objectName);
    }
  }
  
  // Check if file exists
  async fileExists(objectName) {
    if (this.oracleEnabled) {
      return await this.fileExistsOracle(objectName);
    } else {
      return await this.fileExistsLocal(objectName);
    }
  }
  
  // Get file URL
  getFileUrl(objectName) {
    if (this.oracleEnabled) {
      return oracleConfig.getFileUrl(objectName);
    } else {
      return `/uploads/${objectName}`;
    }
  }
  
  // Get pre-authenticated URL (temporary access)
  async getPreAuthenticatedUrl(objectName, expiryMinutes = 60) {
    if (this.oracleEnabled) {
      // TODO: Implement Oracle PAR
      return {
        success: true,
        url: this.getFileUrl(objectName),
        expiresAt: new Date(Date.now() + expiryMinutes * 60000)
      };
    } else {
      return {
        success: true,
        url: this.getFileUrl(objectName),
        expiresAt: new Date(Date.now() + expiryMinutes * 60000)
      };
    }
  }
  
  // Get file metadata
  async getFileMetadata(objectName) {
    if (this.oracleEnabled) {
      return await this.getFileMetadataOracle(objectName);
    } else {
      return await this.getFileMetadataLocal(objectName);
    }
  }
  
  // List objects in folder
  async listObjects(prefix = '', limit = 100) {
    if (this.oracleEnabled) {
      // TODO: Implement Oracle list
      return { success: false, error: 'Not implemented' };
    } else {
      return await this.listObjectsLocal(prefix, limit);
    }
  }
  
  // ==================== SPECIFIC UPLOAD METHODS ====================
  
  // Upload profile picture
  async uploadProfile(fileBuffer, userId, originalName, contentType = null) {
    const folder = oracleConfig.folders.profile;
    const objectName = this.generateObjectName(folder, userId, originalName);
    const mimeType = contentType || FileHelpers.getMimeTypeFromExtension(path.extname(originalName));
    
    return await this.uploadToStorage(fileBuffer, objectName, mimeType, {
      'document-type': 'profile',
      'user-id': userId,
      'original-name': originalName
    });
  }
  
  // Upload certificate
  async uploadCertificate(fileBuffer, studentId, originalName, contentType = null) {
    const folder = oracleConfig.folders.certificate;
    const objectName = this.generateObjectName(folder, studentId, originalName);
    const mimeType = contentType || FileHelpers.getMimeTypeFromExtension(path.extname(originalName));
    
    return await this.uploadToStorage(fileBuffer, objectName, mimeType, {
      'document-type': 'certificate',
      'student-id': studentId,
      'original-name': originalName
    });
  }
  
  // Upload document (generic)
  async uploadDocument(fileBuffer, studentId, originalName, docType = 'document', contentType = null) {
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
      case 'transferCertificate':
      case 'casteCertificate':
        folder = oracleConfig.folders.document;
        break;
      default:
        folder = oracleConfig.folders.document;
    }
    
    const objectName = this.generateObjectName(folder, studentId, originalName);
    const mimeType = contentType || FileHelpers.getMimeTypeFromExtension(path.extname(originalName));
    
    return await this.uploadToStorage(fileBuffer, objectName, mimeType, {
      'document-type': docType,
      'student-id': studentId,
      'original-name': originalName
    });
  }
  
  // Upload marksheet
  async uploadMarksheet(fileBuffer, studentId, originalName, isTwelfth = false) {
    const docType = isTwelfth ? 'twelfthMarksheet' : 'tenthMarksheet';
    return await this.uploadDocument(fileBuffer, studentId, originalName, docType);
  }
  
  // Upload Aadhar card
  async uploadAadharCard(fileBuffer, studentId, originalName) {
    return await this.uploadDocument(fileBuffer, studentId, originalName, 'aadharCard');
  }
  
  // ==================== HELPER METHODS ====================
  
  // Get file info
  async getFileInfo(objectName) {
    const exists = await this.fileExists(objectName);
    const metadata = exists ? await this.getFileMetadata(objectName) : null;
    
    return {
      exists: exists,
      url: this.getFileUrl(objectName),
      objectName: objectName,
      metadata: metadata.success ? metadata.metadata : null
    };
  }
  
  // Get storage type
  getStorageType() {
    return this.oracleEnabled ? 'oracle' : 'local';
  }
}

export default new StorageService();