import path from 'path';
import fs from 'fs';

class FileHelpers {
  // Validate file type
  static isValidFileType(mimetype, allowedTypes) {
    return allowedTypes.includes(mimetype);
  }
  
  // Validate file size
  static isValidFileSize(size, maxSize) {
    return size <= maxSize;
  }
  
  // Get file extension
  static getFileExtension(filename) {
    return path.extname(filename).toLowerCase();
  }
  
  // Get file mime type from extension
  static getMimeTypeFromExtension(ext) {
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }
  
  // Format file size
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  // Generate unique filename
  static generateUniqueFilename(originalName, prefix = '') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9]/g, '_');
    return `${prefix}${baseName}_${timestamp}_${random}${ext}`;
  }
  
  // Delete local file
  static deleteLocalFile(filePath) {
    return new Promise((resolve, reject) => {
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) reject(err);
          else resolve(true);
        });
      } else {
        resolve(false);
      }
    });
  }
  
  // Check if file exists locally
  static fileExists(filePath) {
    return fs.existsSync(filePath);
  }
  
  // Create directory if not exists
  static ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
}

export default FileHelpers;