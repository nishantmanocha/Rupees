import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

// Import configurations
import env from './config/environment';
import connectDB from './config/database';
import logger from './config/logger';

// Import middleware
import {
  rateLimiter,
  errorHandler,
  notFoundHandler,
  setupGlobalErrorHandlers
} from './middleware';

// Import routes (will be created next)
// import authRoutes from './routes/auth';
// import userRoutes from './routes/user';
// import financeRoutes from './routes/finance';
// import goalRoutes from './routes/goal';
// import instrumentRoutes from './routes/instrument';
// import compareRoutes from './routes/compare';
// import tipsRoutes from './routes/tips';
// import learnRoutes from './routes/learn';
// import settingsRoutes from './routes/settings';
// import backupRoutes from './routes/backup';

// Setup global error handlers
setupGlobalErrorHandlers();

// Create Express app
const app = express();

// Trust proxy (for rate limiting to work correctly behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.http(message.trim())
  }
}));

// Rate limiting
app.use(rateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API routes
const apiPrefix = `/api/${env.API_VERSION}`;

// Mount routes (commented out until routes are created)
// app.use(`${apiPrefix}/auth`, authRoutes);
// app.use(`${apiPrefix}/users`, userRoutes);
// app.use(`${apiPrefix}/finance`, financeRoutes);
// app.use(`${apiPrefix}/goals`, goalRoutes);
// app.use(`${apiPrefix}/instruments`, instrumentRoutes);
// app.use(`${apiPrefix}/compare`, compareRoutes);
// app.use(`${apiPrefix}/tips`, tipsRoutes);
// app.use(`${apiPrefix}/learn`, learnRoutes);
// app.use(`${apiPrefix}/settings`, settingsRoutes);
// app.use(`${apiPrefix}/backup`, backupRoutes);

// Placeholder route for now
app.get(apiPrefix, (req, res) => {
  res.json({
    success: true,
    message: 'Savings Planner API v1',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: `${apiPrefix}/auth`,
      users: `${apiPrefix}/users`,
      finance: `${apiPrefix}/finance`,
      goals: `${apiPrefix}/goals`,
      instruments: `${apiPrefix}/instruments`,
      compare: `${apiPrefix}/compare`,
      tips: `${apiPrefix}/tips`,
      learn: `${apiPrefix}/learn`,
      settings: `${apiPrefix}/settings`,
      backup: `${apiPrefix}/backup`
    }
  });
});

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Start server function
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDB();
    
    // Start server
    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      logger.info(`📊 API available at http://localhost:${env.PORT}${apiPrefix}`);
      logger.info(`🏥 Health check at http://localhost:${env.PORT}/health`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string): Promise<void> => {
      logger.info(`\n${signal} received. Starting graceful shutdown...`);
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        try {
          // Close database connection
          const mongoose = await import('mongoose');
          await mongoose.connection.close();
          logger.info('Database connection closed');
          
          logger.info('Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during graceful shutdown:', error);
          process.exit(1);
        }
      });

      // Force close after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('unhandledRejection');
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}

export default app;