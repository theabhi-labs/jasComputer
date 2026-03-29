// src/config/envValidator.js
import dotenv from 'dotenv';

dotenv.config();

class EnvValidator {
  static requiredVars = [
    'PORT',
    'NODE_ENV',
    'MONGODB_URI',
    'JWT_SECRET',
    'FRONTEND_URL'
  ];
  
  // SMTP is optional now (for email)
  static optionalVars = [
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'SMTP_SENDER_EMAIL',
    'SMTP_SENDER_NAME'
  ];
  
  static validate() {
    const missing = [];
    
    for (const varName of this.requiredVars) {
      if (!process.env[varName]) {
        missing.push(varName);
      }
    }
    
    if (missing.length > 0) {
      console.error('❌ Missing required environment variables:');
      missing.forEach(v => console.error(`   - ${v}`));
      console.error('\nPlease check your .env file');
      process.exit(1);
    }
    
    // Validate numeric values
    if (process.env.PORT && isNaN(parseInt(process.env.PORT))) {
      console.error('❌ PORT must be a number');
      process.exit(1);
    }
    
    // Validate JWT secret strength
    if (process.env.NODE_ENV === 'production' && 
        process.env.JWT_SECRET === 'your_super_secret_key_change_this_in_production') {
      console.error('❌ Please change JWT_SECRET in production!');
      process.exit(1);
    }
    
    // Log optional SMTP status
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      console.log('✅ SMTP configured for email sending');
    } else {
      console.log('⚠️ SMTP not configured - email features will be disabled');
    }
    
    console.log('✅ Environment variables validated successfully');
  }
  
  static get(key, defaultValue = null) {
    return process.env[key] || defaultValue;
  }
  
  static isProduction() {
    return process.env.NODE_ENV === 'production';
  }
  
  static isDevelopment() {
    return process.env.NODE_ENV === 'development';
  }
  
  static isStaging() {
    return process.env.NODE_ENV === 'staging';
  }
}

export default EnvValidator;