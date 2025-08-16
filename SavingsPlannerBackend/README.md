# Savings Planner Backend API

A production-ready Node.js + Express + TypeScript backend for the Savings Planner mobile application. This API provides comprehensive financial planning, expense tracking, goal management, and investment comparison capabilities.

## 🚀 Features

### Core Functionality
- **User Authentication & Authorization**
  - JWT-based authentication with access + refresh tokens
  - Role-based access control (User/Admin)
  - Password reset via OTP email
  - Secure password hashing with bcrypt

- **Financial Management**
  - Income tracking and updates
  - Expense categorization and management
  - Monthly surplus calculations
  - Financial tips engine based on spending patterns

- **Savings Goals**
  - Goal creation and management
  - Saving-only vs. investing projections
  - Time-to-goal calculations
  - Primary goal designation

- **Investment Analysis**
  - Pre-configured investment instruments (PPF, Nifty 50, Gold ETF, etc.)
  - SIP-style investment projections
  - Comparison charts (line + bar)
  - User-customizable return rates

- **Educational Content**
  - Q&A and checklist-based learning
  - Categorized financial education
  - Admin-manageable content

- **Data Management**
  - Backup and restore functionality
  - User preferences and settings
  - Theme customization

### Technical Features
- **Production Ready**
  - Docker containerization
  - Rate limiting and security headers
  - Comprehensive error handling
  - Structured logging with Winston
  - Health check endpoints

- **Performance & Scalability**
  - MongoDB with optimized indexes
  - Connection pooling
  - Efficient aggregation pipelines
  - Pagination support

- **Security**
  - Input validation with Zod
  - CORS configuration
  - Helmet security headers
  - Rate limiting protection
  - SQL injection prevention

## 🛠 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod schema validation
- **Security**: Helmet, CORS, bcrypt
- **Rate Limiting**: rate-limiter-flexible
- **Logging**: Winston + Morgan
- **Email**: Nodemailer
- **Containerization**: Docker + Docker Compose
- **Testing**: Jest + Supertest

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB 7.0+
- Docker & Docker Compose (optional)
- npm or yarn

## 🚀 Quick Start

### Option 1: Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SavingsPlannerBackend
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Access the API**
   - API: http://localhost:5000
   - Health Check: http://localhost:5000/health
   - MongoDB Express: http://localhost:8081 (admin/password123)

### Option 2: Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup environment**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB connection and other settings
   ```

3. **Start MongoDB** (if not using Docker)
   ```bash
   # Start MongoDB service or use MongoDB Atlas
   ```

4. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production build
   npm run build
   npm start
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database
MONGODB_URI=mongodb://localhost:27017/savings_planner

# JWT Configuration
JWT_ACCESS_SECRET=your-super-secret-access-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here

# Email Configuration (for OTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Database Setup

The application automatically creates:
- Database collections with validation
- Default investment instruments
- Sample learning content
- Admin user (admin@savingsplanner.com / admin123)

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | User registration |
| POST | `/auth/login` | User login |
| POST | `/auth/logout` | User logout |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/forgot-password` | Request password reset OTP |
| POST | `/auth/reset-password` | Reset password with OTP |

### User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/me` | Get current user profile |
| PATCH | `/users/me` | Update user profile |
| GET | `/users/settings` | Get user settings |
| PATCH | `/users/settings` | Update user settings |
| GET | `/users/financial-summary` | Get financial overview |
| GET | `/users/stats` | Get user statistics |
| GET | `/users/export` | Export user data |

### Financial Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/finance` | Get financial overview |
| PATCH | `/finance/income` | Update monthly income |
| GET | `/finance/expenses` | Get all expenses |
| POST | `/finance/expenses` | Create new expense |
| PATCH | `/finance/expenses/:id` | Update expense |
| DELETE | `/finance/expenses/:id` | Delete expense |
| GET | `/finance/expenses/stats` | Get expense statistics |

### Goals Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/goals` | Get all goals |
| POST | `/goals` | Create new goal |
| GET | `/goals/:id` | Get goal details |
| PATCH | `/goals/:id` | Update goal |
| DELETE | `/goals/:id` | Delete goal |

### Investment Analysis

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/instruments` | Get investment instruments |
| POST | `/compare` | Compare investment strategies |
| GET | `/tips` | Get financial tips |

### Learning & Education

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/learn` | Get learning content |
| GET | `/learn/categories` | Get content categories |

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🐳 Docker Commands

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Access MongoDB shell
docker exec -it savings_planner_mongodb mongosh -u admin -p password123

# Access backend container
docker exec -it savings_planner_backend sh
```

## 📁 Project Structure

```
src/
├── config/           # Configuration files
│   ├── database.ts   # MongoDB connection
│   ├── environment.ts # Environment variables
│   └── logger.ts     # Winston logger setup
├── controllers/      # Route controllers
│   ├── authController.ts
│   ├── userController.ts
│   └── financeController.ts
├── middleware/       # Express middleware
│   ├── auth.ts       # Authentication
│   ├── validation.ts # Request validation
│   ├── errorHandler.ts # Error handling
│   └── rateLimiter.ts # Rate limiting
├── models/           # Mongoose models
│   ├── User.ts
│   ├── Expense.ts
│   ├── Goal.ts
│   └── Instrument.ts
├── routes/           # API routes (to be implemented)
├── services/         # Business logic (to be implemented)
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
│   ├── jwt.ts        # JWT utilities
│   ├── financialCalculations.ts # Financial math
│   └── tipsEngine.ts # Financial tips logic
└── index.ts          # Main application file
```

## 🔒 Security Features

- **Authentication**: JWT-based with refresh token rotation
- **Authorization**: Role-based access control
- **Input Validation**: Zod schema validation for all inputs
- **Rate Limiting**: Configurable rate limiting per IP
- **Security Headers**: Helmet.js for security headers
- **CORS**: Configurable cross-origin resource sharing
- **Password Security**: bcrypt with configurable rounds
- **Database Security**: MongoDB validation and indexing

## 📊 Database Schema

### Collections
- **users**: User accounts and profiles
- **expenses**: User expense records
- **goals**: Savings goals and targets
- **instruments**: Investment instruments and rates
- **user_instrument_overrides**: User-specific rate overrides
- **learning_items**: Educational content
- **user_settings**: User preferences and settings
- **otps**: One-time passwords for password reset

### Indexes
- Email uniqueness for users
- User ID + category for expenses
- User ID + primary flag for goals
- Enabled status for instruments
- Category + published status for learning items

## 🚀 Deployment

### Production Considerations

1. **Environment Variables**
   - Use strong, unique JWT secrets
   - Configure production MongoDB URI
   - Set up email service credentials
   - Configure CORS origins properly

2. **Security**
   - Enable HTTPS in production
   - Use environment-specific rate limits
   - Monitor and log security events
   - Regular security updates

3. **Performance**
   - Use Redis for rate limiting in production
   - Configure MongoDB connection pooling
   - Enable compression middleware
   - Use CDN for static assets

4. **Monitoring**
   - Health check endpoints
   - Application metrics
   - Error tracking and alerting
   - Performance monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the code examples

## 🔄 Changelog

### v1.0.0
- Initial release
- Complete authentication system
- Financial management APIs
- Investment analysis tools
- Educational content system
- Docker containerization
- Comprehensive testing setup

---

**Built with ❤️ for better financial planning**