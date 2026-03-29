import oracleCloud from 'oracle-cloud-storage-sdk';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import oracleConfig from '../config/oracle.js';

class StorageService {
  constructor() {
    this.client = null;
    this.namespace = oracleConfig.namespace;
    this.bucketName = oracleConfig.bucketName;
    this.region = oracleConfig.region;
    this.initializeClient();
  }

  initializeClient() {
    try {
      this.client = new oracleCloud({
        auth: {
          tenancyId: oracleConfig.tenancyId,
          userId: oracleConfig.userId,
          fingerprint: oracleConfig.fingerprint,
          privateKey: oracleConfig.privateKey,
          passphrase: oracleConfig.passphrase || ''
        },
        region: this.region,
        namespace: this.namespace
      });
    } catch (error) {
      console.error('Failed to initialize Oracle Cloud client:', error);
    }
  }

  // Generate unique object name
  generateObjectName(folder, studentId, originalName) {
    const timestamp = Date.now();
    const uniqueId = uuidv4().substring(0, 8);
    const extension = path.extname(originalName);
    const fileName = `${studentId}_${timestamp}_${uniqueId}${extension}`;
    return `${folder}/${fileName}`;
  }

  // Upload file to Oracle Cloud
  async uploadToOracle(fileBuffer, objectName, contentType) {
    try {
      const response = await this.client.putObject({
        bucketName: this.bucketName,
        objectName: objectName,
        content: fileBuffer,
        contentType: contentType,
        metadata: {
          'upload-timestamp': new Date().toISOString(),
          'content-length': fileBuffer.length.toString()
        }
      });

      if (response && response.etag) {
        const url = this.getFileUrl(objectName);
        return {
          success: true,
          url: url,
          objectName: objectName,
          etag: response.etag
        };
      }

      return {
        success: false,
        error: 'Upload failed - no ETag received'
      };
    } catch (error) {
      console.error('Oracle Cloud upload error:', error);
      return {
        success: false,
        error: error.message || 'Upload failed'
      };
    }
  }

  // Delete file from Oracle Cloud
  async deleteFromOracle(objectName) {
    try {
      await this.client.deleteObject({
        bucketName: this.bucketName,
        objectName: objectName
      });

      return {
        success: true,
        message: 'File deleted successfully'
      };
    } catch (error) {
      console.error('Oracle Cloud delete error:', error);
      return {
        success: false,
        error: error.message || 'Delete failed'
      };
    }
  }

  // Get file URL
  getFileUrl(objectName) {
    // Generate pre-authenticated request URL or direct URL
    const baseUrl = `https://objectstorage.${this.region}.oraclecloud.com`;
    const url = `${baseUrl}/n/${this.namespace}/b/${this.bucketName}/o/${encodeURIComponent(objectName)}`;
    return url;
  }

  // Generate pre-authenticated request URL (for temporary access)
  async getPreAuthenticatedUrl(objectName, expiryMinutes = 60) {
    try {
      const response = await this.client.createPreAuthenticatedRequest({
        bucketName: this.bucketName,
        objectName: objectName,
        accessType: 'ObjectRead',
        timeExpires: new Date(Date.now() + expiryMinutes * 60000).toISOString()
      });

      return {
        success: true,
        url: response.accessUri
      };
    } catch (error) {
      console.error('Error generating pre-authenticated URL:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Upload profile picture
  async uploadProfile(fileBuffer, userId, originalName, contentType = 'image/jpeg') {
    try {
      const folder = oracleConfig.folders.profile;
      const objectName = this.generateObjectName(folder, userId, originalName);
      
      const result = await this.uploadToOracle(fileBuffer, objectName, contentType);
      
      if (result.success) {
        // Update user's profile image URL in database would be handled by controller
        return result;
      }
      
      return result;
    } catch (error) {
      console.error('Upload profile error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Upload certificate
  async uploadCertificate(fileBuffer, studentId, originalName, contentType = 'application/pdf') {
    try {
      const folder = oracleConfig.folders.certificate;
      const objectName = this.generateObjectName(folder, studentId, originalName);
      
      return await this.uploadToOracle(fileBuffer, objectName, contentType);
    } catch (error) {
      console.error('Upload certificate error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Upload document (marksheet, aadhar, etc.)
  async uploadDocument(fileBuffer, studentId, originalName, docType, contentType = 'application/pdf') {
    try {
      let folder;
      
      // Determine folder based on document type
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
          contentType = 'image/jpeg';
          break;
        case 'transferCertificate':
        case 'casteCertificate':
        default:
          folder = oracleConfig.folders.document;
          break;
      }
      
      const objectName = this.generateObjectName(folder, studentId, originalName);
      
      return await this.uploadToOracle(fileBuffer, objectName, contentType);
    } catch (error) {
      console.error('Upload document error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Upload multiple documents in parallel
  async uploadMultipleDocuments(files, studentId) {
    try {
      const uploadPromises = files.map(async (file) => {
        const docType = file.fieldname;
        const result = await this.uploadDocument(
          file.buffer,
          studentId,
          file.originalname,
          docType,
          file.mimetype
        );
        
        return {
          field: docType,
          originalName: file.originalname,
          ...result
        };
      });
      
      const results = await Promise.all(uploadPromises);
      
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      
      return {
        success: successCount > 0,
        results: results,
        summary: {
          total: files.length,
          success: successCount,
          failed: failureCount
        }
      };
    } catch (error) {
      console.error('Upload multiple documents error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get file metadata
  async getFileMetadata(objectName) {
    try {
      const response = await this.client.headObject({
        bucketName: this.bucketName,
        objectName: objectName
      });
      
      return {
        success: true,
        metadata: {
          etag: response.etag,
          contentType: response.contentType,
          contentLength: response.contentLength,
          lastModified: response.lastModified,
          metadata: response.metadata
        }
      };
    } catch (error) {
      console.error('Error getting file metadata:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Check if file exists
  async fileExists(objectName) {
    try {
      await this.client.headObject({
        bucketName: this.bucketName,
        objectName: objectName
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Copy file
  async copyFile(sourceObjectName, destinationObjectName) {
    try {
      await this.client.copyObject({
        bucketName: this.bucketName,
        sourceObjectName: sourceObjectName,
        destinationObjectName: destinationObjectName
      });
      
      return {
        success: true,
        objectName: destinationObjectName,
        url: this.getFileUrl(destinationObjectName)
      };
    } catch (error) {
      console.error('Error copying file:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new StorageService();