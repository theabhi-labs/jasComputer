import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// ES6 dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config();

// Import routes
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import batchRoutes from './routes/batchRoutes.js';
import feeRoutes from './routes/feeRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import inquiryRoutes from './routes/inquiryRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import userRoutes from './routes/userRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';

// Import middleware
import { errorMiddleware, notFound } from './middleware/errorMiddleware.js';

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// ==================== CORS CONFIGURATION ====================
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

// Log allowed origins for debugging
console.log('CORS allowed origins:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // Allow all origins in development
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('CORS blocked origin:', origin);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/fee', feeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teachers', teacherRoutes);


// 404 handler
app.use(notFound);

// Error handler
app.use(errorMiddleware);

export default app;