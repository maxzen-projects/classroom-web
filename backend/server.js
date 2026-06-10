require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const morgan = require('morgan');
const { createServer } = require('http');
const { Server } = require('socket.io');


// Import custom logger (optional)
let logger;
try {
  logger = require('./utils/logger');
} catch (error) {
  // Fallback to console if winston not installed
  logger = {
    info: console.log,
    error: console.error,
    http: console.log,
  };
}

// Import routes
const authRoutes = require('./routes/auth');
const classesRoutes = require('./routes/classes');
const studentsRoutes = require('./routes/students');
const teachersRoutes = require('./routes/teachers');
const teacherRoutes = require('./routes/teacher');
const subjectRoutes = require('./routes/subjects');
const chapterRoutes = require('./routes/chapters');
const lessonRoutes = require('./routes/lessons');
const adminRoutes = require('./routes/admin');
const superAdminRoutes = require('./routes/superAdmin');
const schoolRoutes = require('./routes/schools');
const liveClassRoutes = require('./routes/liveClasses');
const subjectAssignmentRoutes = require('./routes/subjectAssignments');
const attendanceRoutes = require('./routes/attendance');
const feeRoutes = require('./routes/fees');
const assignmentRoutes = require('./routes/assignments');
const timetableRoutes = require('./routes/timetable');
const submissionRoutes = require('./routes/submissions');
const analyticsRoutes = require('./routes/analytics');
const externalExamsRoutes = require('./routes/externalExams');
const billingRoutes = require('./routes/billing');
const permissionsRoutes = require('./routes/permissions');

// Import middleware and config
const errorHandler = require('./middleware/errorHandler');
const connectDB = require('./config/database');
const socketHandler = require('./sockets/socketHandler');
const { initializeBillingCrons } = require('./utils/billingCrons');

// Create Express app
const app = express();

// ✅ CORS CONFIG FIRST
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173'
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};

// 1. CORS FIRST
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "data:"],
      connectSrc: ["'self'", "http://localhost:5173", "http://localhost:5000"],
      frameSrc: ["'self'", "http://localhost:5173", "http://localhost:5000"],
      frameAncestors: ["'self'", "http://localhost:5173", "http://localhost:5000"],
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);


// Compression middleware
app.use(compression());

// Morgan HTTP request logging (optional)
try {
  const morgan = require('morgan');
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.http(message.trim())
    }
  }));
} catch (error) {
  // Skip morgan if not installed
  console.log('Morgan not installed, skipping HTTP request logging');
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Classroom LMS Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/teachers', teachersRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/subject-assignments', subjectAssignmentRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/live-classes', liveClassRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/external-exams', externalExamsRoutes);
app.use('/api/permissions', permissionsRoutes);

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Create HTTP server
const server = createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Initialize socket handler
const socketService = socketHandler(io);
app.locals.socketService = socketService;

// Connect to MongoDB
connectDB();

// Initialize billing automation crons
try {
  initializeBillingCrons();
  logger.info('✅ Billing automation cron jobs initialized');
} catch (error) {
  logger.error('❌ Failed to initialize billing crons:', error.message);
}

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📱 Socket.IO server initialized`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/health`);
  logger.info(`💰 Billing System: Ready`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

module.exports = { server, io };
