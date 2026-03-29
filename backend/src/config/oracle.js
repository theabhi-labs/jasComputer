// config/oracle.js
import path from 'path';
import { fileURLToPath } from 'url';  // ✅ Fixed: fileURLToUrl → fileURLToPath

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const oracleConfig = {
  // Object Storage Configuration
  objectStorage: {
    namespace: process.env.ORACLE_NAMESPACE || '',
    bucketName: process.env.ORACLE_BUCKET_NAME || 'coaching-files',
    region: process.env.ORACLE_REGION || 'ap-mumbai-1',
    compartmentId: process.env.ORACLE_COMPARTMENT_ID || '',
    
    // Authentication
    tenancyId: process.env.ORACLE_TENANCY_OCID || '',
    userId: process.env.ORACLE_USER_OCID || '',
    fingerprint: process.env.ORACLE_FINGERPRINT || '',
    privateKeyPath: process.env.ORACLE_PRIVATE_KEY_PATH || '',
    privateKey: process.env.ORACLE_PRIVATE_KEY || ''
  },
  
  // Folder structure
  folders: {
    profile: 'profiles/',
    certificate: 'certificates/',
    document: 'documents/',
    marksheet: 'marksheets/',
    aadhar: 'aadhar/',
    temp: 'temp/'
  },
  
  // Allowed file types
  allowedTypes: {
    profile: ['image/jpeg', 'image/jpg', 'image/png'],
    certificate: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
    document: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
    marksheet: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
    aadhar: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
  },
  
  // Max file sizes (bytes)
  maxFileSizes: {
    profile: 2 * 1024 * 1024,      // 2MB
    certificate: 5 * 1024 * 1024,   // 5MB
    document: 10 * 1024 * 1024,     // 10MB
    marksheet: 5 * 1024 * 1024,     // 5MB
    aadhar: 2 * 1024 * 1024         // 2MB
  },
  
  // Get file URL
  getFileUrl: (objectName) => {
    const { namespace, bucketName, region } = oracleConfig.objectStorage;
    // If Oracle credentials are configured, return Oracle URL
    if (namespace && bucketName && region) {
      return `https://objectstorage.${region}.oraclecloud.com/n/${namespace}/b/${bucketName}/o/${encodeURIComponent(objectName)}`;
    }
    // Otherwise return local URL (for development)
    return `/uploads/${objectName}`;
  },
  
  // Generate object name
  generateObjectName: (folder, userId, originalName) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
    return `${folder}${userId}_${timestamp}_${random}_${baseName}${ext}`;
  },
  
  // Check if Oracle is configured
  isOracleConfigured: () => {
    return !!(oracleConfig.objectStorage.namespace && 
              oracleConfig.objectStorage.privateKey);
  }
};

export default oracleConfig;