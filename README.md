# SupaSafe - Enterprise-Grade Password Manager

## 👥 Meet the  SupaSafe Team



👤 **[Mohannad Abdelkarim (MohannadAK)]**   

👤 **[Ahmed Tawfik (Ahmed0Tawfik)]**

👤 **[Menna Selim (MeN1na)]**   

👤 **[Mahmoud Almokaber (Mahmoud-Elmokaber)]** 

👤 **[Ahmed Elbahgy (ahmedelbahgy22)]**

👤 **[Abdullah Elsheshtawy (Abdoshsht226)]**

<div align="center">
  <img src="/Docs/Logo.jpg" alt="SupaSafe Logo" width="200"/>
  
  [![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
  [![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
  [![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
  [![Express.js](https://img.shields.io/badge/Express.js-404D59?style=flat)](https://expressjs.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
</div>

## 📑 Table of Contents
- [Overview](#-overview)
- [Features](#-features)
- [Technical Stack](#-technical-stack)
- [Project Structure](#-project-structure)
- [Security Architecture](#-security-architecture)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Development Workflow](#-development-workflow)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Team](#-team)
- [License](#-license)
- [System Architecture](#-system-architecture)

## 🌟 Overview

SupaSafe is an enterprise-grade password management system that combines robust security with user-friendly features. Built with modern technologies and security best practices, it provides a secure vault for managing sensitive credentials while maintaining the highest standards of data protection.

### Key Highlights
- 🔒 Zero-knowledge architecture
- 🚀 High-performance encryption
- 📱 Cross-platform compatibility
- 🎯 User-friendly interface
- 🔐 Enterprise-grade security
- 🌐 Scalable architecture

## ✨ Features

### Security Features
- **End-to-End Encryption**
  - AES-256-CBC encryption for all stored data
  - Unique initialization vectors (IV) per password
  - Secure key derivation using PBKDF2
  - Zero-knowledge architecture implementation

- **Authentication & Authorization**
  - JWT-based authentication with token versioning
  - bcrypt password hashing (12 rounds)
  - Rate limiting for brute force protection
  - Session management with secure token storage
  - Cross-device session handling

- **Data Protection**
  - Master password never leaves client
  - Key Encryption Key (KEK) derivation
  - Data Encryption Key (DEK) management
  - Secure key rotation mechanisms
  - Encrypted backup and recovery

### User Features
- **Password Management**
  - Secure password storage and retrieval
  - Password strength analysis
  - Password history tracking
  - Secure password sharing
  - Password expiration management
  - Bulk password operations

- **User Experience**
  - Intuitive dashboard interface
  - Password categorization and tagging
  - Search and filter capabilities
  - Auto-fill functionality
  - Password generator with customization
  - Import/Export functionality

- **Account Management**
  - Secure registration and login
  - Master password change
  - Account recovery options
  - Two-factor authentication
  - Session management
  - Activity logging

- **Additional Features**
  - Password health monitoring
  - Breach detection
  - Secure notes storage
  - File attachments
  - Audit logging
  - API access for enterprise

## 🛠 Technical Stack

### Frontend Technologies
- **Core Framework**
  - React 18.x
  - TypeScript 4.x
  - Redux Toolkit for state management
  - React Router for navigation
  - React Query for data fetching

- **UI/UX**
  - Tailwind CSS for styling
  - Headless UI components
  - React Hook Form for forms
  - React Icons
  - Framer Motion for animations



### Backend Technologies
- **Core Framework**
  - Node.js 18.x
  - Express.js 4.x
  - Sequelize ORM
  - PostgreSQL 14.x

- **Security**
  - crypto-js for encryption
  - bcrypt for password hashing
  - jsonwebtoken for JWT
  - helmet for security headers
  - express-rate-limit
  - cors for cross-origin

- **Development Tools**
  - Nodemon for development
  - Swagger for API documentation

### DevOps & Infrastructure
- **Containerization**
  - Docker
  - Docker Compose
  - Multi-stage builds

- **CI/CD**
  - GitHub Actions
  - Automated testing
  - Deployment pipelines
  - Code quality checks

- **Monitoring**

## 📁 Project Structure

```
supasafe/
├── Client/                      # Frontend application
│   ├── public/                  # Static files
│   │   └── assets/             # Images, fonts, etc.
│   │
│   ├── src/                    # Source code
│   │   ├── components/         # React components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   ├── store/             # Redux store
│   │   ├── styles/            # Global styles
│   │   ├── utils/             # Utility functions
│   │   └── App.tsx            # Root component
│   │
│   ├── .gitignore             # Git ignore rules
│   ├── package.json           # Dependencies
│   ├── postcss.config.js      # PostCSS config
│   ├── tailwind.config.js     # Tailwind config
│   └── yarn.lock              # Yarn lock file
│
├── Server/                     # Backend application
│   ├── src/                   # Source code
│   │   ├── config/           # Configuration files
│   │   ├── controllers/      # Route controllers
│   │   ├── middleware/       # Express middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   └── app.ts           # Express app
│   │
│   ├── .gitignore           # Git ignore rules
│   ├── .sequelizerc         # Sequelize config
│   ├── package.json         # Dependencies
│   └── start.sh            # Startup script
│
├── Docs/                     # Documentation
│   ├── Logo.jpg             # Project logo
│   └── README.md            # Documentation files
│
├── .dockerignore            # Docker ignore rules
├── .gitignore              # Root git ignore rules
├── docker-compose.yml      # Docker compose config
├── Dockerfile              # Docker configuration
├── LICENSE                 # MIT License
└── README.md              # Project documentation
```

## 🔒 Security Architecture

### Encryption System
1. **Master Password Protection**
   - bcrypt hashing (12 rounds)
   - Unique salt per user
   - PBKDF2 key derivation
   - Secure password validation

2. **Key Management**
   - Key Encryption Key (KEK) derivation
   - Data Encryption Key (DEK) generation
   - Secure key storage
   - Key rotation policies

3. **Data Encryption**
   - AES-256-CBC encryption
   - Unique IV per password
   - Encrypted metadata
   - Secure backup system

### Authentication Flow
1. **Registration**
   - Password strength validation
   - Secure key generation
   - Initial token creation
   - Account setup

2. **Login Process**
   - Credential verification
   - Token generation
   - Session management
   - Device tracking

3. **Session Management**
   - JWT token handling
   - Token versioning
   - Session invalidation
   - Cross-device sync

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Docker (optional)
- Git

### Installation

1. **Clone the Repository**
```bash
git clone https://github.com/MohannadAK/supasafe.git
cd supasafe
```

2. **Environment Setup**
```bash
# Frontend
cd client
cp .env.example .env
npm install

# Backend
cd ../server
cp .env.example .env
npm install
```

3. **Database Setup**
```bash
# Create database
createdb supasafe_db

# Run migrations
cd server
npx sequelize-cli db:migrate

# Seed data (optional)
npx sequelize-cli db:seed:all
```

4. **Development Start**
```bash
# Start backend
cd server
npm run dev

# Start frontend (new terminal)
cd client
npm run dev
```

5. **Docker Setup (Alternative)**
```bash
# Build and start containers
docker-compose up --build
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `PUT /api/auth/change-password` - Password change
- `POST /api/auth/refresh-token` - Token refresh
- `POST /api/auth/forgot-password` - Password recovery
- `POST /api/auth/reset-password` - Password reset

### Password Management
- `GET /api/passwords` - List passwords
- `POST /api/passwords` - Create password
- `GET /api/passwords/:id` - Get password
- `PUT /api/passwords/:id` - Update password
- `DELETE /api/passwords/:id` - Delete password
- `GET /api/passwords/health` - Password health check
- `POST /api/passwords/import` - Import passwords
- `GET /api/passwords/export` - Export passwords

### User Management
- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/sessions` - List sessions
- `DELETE /api/users/sessions/:id` - End session

## 👥 Team

### Core Team Members

<div align="center">

| Name | GitHub Profile |
|-----|---------------|
| [@MohannadAK](https://github.com/MohannadAK) |
| [@Ahmed0Tawfik](https://github.com/Ahmed0Tawfik) |
| [@MeN1na](https://github.com/MeN1na) |
| [@Mahmoud-Elmokaber](https://github.com/Mahmoud-Elmokaber) |
| [@ahmedelbahgy22](https://github.com/ahmedelbahgy22) |
| [@Abdoshsht226](https://github.com/Abdoshsht226) |

</div>


## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Live Demo](https://supasafe-showcase.vercel.app/)
- [Documentation](https://supasafe-docs.vercel.app/)
- [Issue Tracker](https://github.com/MohannadAK/supasafe/issues)
- [Contributing Guide](CONTRIBUTING.md)

---

<div align="center">
  <p>Built with ❤️ by the SupaSafe Team</p>
  <p>© 2024 SupaSafe. All rights reserved.</p>
</div>

## 🏗 System Architecture

### Database Design
<div align="center">
  <h3>Entity Relationship Diagram (ERD)</h3>
  <img src="/Docs/Database Design-Schema/ERD.png" alt="Entity Relationship Diagram" width="800"/>
  
  <h3>Database Schema</h3>
  <img src="/Docs/Database Design-Schema/Database Schema.png" alt="Database Schema" width="800"/>
</div>

### System Design
<div align="center">
  <h3>High-Level System Overview</h3>
  <img src="/Docs/System Design Diagrams/HighLevel System OverView.png" alt="High-Level System Overview" width="800"/>
  
  <h3>Development Pipeline</h3>
  <img src="/Docs/System Design Diagrams/PipeLine.png" alt="Development Pipeline" width="800"/>
</div>

### Key Workflows
<div align="center">
  <h3>Authentication Flows</h3>
  <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">
    <div>
      <h4>User Registration</h4>
      <img src="/Docs/System Design Diagrams/Register User Flow.png" alt="Registration Flow" width="400"/>
    </div>
    <div>
      <h4>User Login</h4>
      <img src="/Docs/System Design Diagrams/Login User Flow.png" alt="Login Flow" width="400"/>
    </div>
    <div>
      <h4>User Logout</h4>
      <img src="/Docs/System Design Diagrams/Logout User Flow.png" alt="Logout Flow" width="400"/>
    </div>
  </div>

  <h3>Password Management Flows</h3>
  <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">
    <div>
      <h4>Add Password</h4>
      <img src="/Docs/System Design Diagrams/Add Password Flow.png" alt="Add Password Flow" width="400"/>
    </div>
    <div>
      <h4>Retrieve Password</h4>
      <img src="/Docs/System Design Diagrams/Retrieve Password Flow.png" alt="Retrieve Password Flow" width="400"/>
    </div>
    <div>
      <h4>Update Password</h4>
      <img src="/Docs/System Design Diagrams/Update Password Flow.png" alt="Update Password Flow" width="400"/>
    </div>
    <div>
      <h4>Delete Password</h4>
      <img src="/Docs/System Design Diagrams/Delete Password Flow.png" alt="Delete Password Flow" width="400"/>
    </div>
  </div>
</div>
