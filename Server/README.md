# Node.js PostgreSQL API

A production-ready RESTful API built with Node.js, Express, and PostgreSQL.

## Features

- **RESTful API Architecture**: Follows best practices for route organization and naming.
- **PostgreSQL Database**: Uses Sequelize ORM for database interactions.
- **Authentication**: JWT-based authentication system with refresh tokens.
- **Authorization**: Role-based access control for protected routes.
- **Validation**: Request validation using express-validator.
- **Error Handling**: Centralized error handling mechanism.
- **Logging**: Advanced logging with Winston.
- **Environment Configuration**: Using dotenv for environment variables.
- **Security**: Implements helmet for setting security-related HTTP headers.
- **CORS Support**: Configured Cross-Origin Resource Sharing.
- **Code Quality**: ESLint configured for code linting.
- **Testing**: Jest configured for unit and integration tests.

## Directory Structure

```
.
├── src/                    # Source code
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── db/                 # Database migrations and seeds
│   │   ├── migrations/     # Sequelize migrations
│   │   └── seeds/          # Sequelize seeds
│   ├── middleware/         # Custom middleware
│   ├── models/             # Sequelize models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── tests/              # Tests
│   │   ├── integration/    # Integration tests
│   │   └── unit/           # Unit tests
│   ├── utils/              # Utility functions
│   ├── app.js              # Express app setup
│   └── server.js           # Server entry point
├── .env.example            # Example environment variables
├── .gitignore              # Git ignore file
├── .sequelizerc            # Sequelize configuration
├── package.json            # Project dependencies
└── README.md               # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- PostgreSQL (v12+)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd node-postgres-api
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
# Edit .env file with your configuration
```

4. Create databases:

```bash
# Create development and test databases in PostgreSQL
createdb api_dev
createdb api_test
```

5. Run migrations:

```bash
npm run migrate
```

6. Seed the database (optional):

```bash
npm run seed
```

### Running the Application

```bash
# Development mode
npm run dev

# Production mode
npm start
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## API Endpoints

### Auth Routes

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout user

### User Routes

- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create a new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## License

This project is licensed under the ISC License. 