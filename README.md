# SupaSafe - Secure Password Management

<div align="center">
  
![SupaSafe Logo](/Docs/Logo.jpg)

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=flat)](https://expressjs.com/)

</div>

## 🔒 Overview

SupaSafe is a high-security password management solution designed with enterprise-grade encryption standards. Our application empowers users to securely store, manage, and retrieve sensitive credentials through an intuitive interface while maintaining rigorous security protocols.

<div align="center">
  <img src="/Docs/UI Mockups-Design/Dashboard.png" alt="SupaSafe Dashboard" />
</div>

<div align="center">
  <a href="https://supasafe-showcase.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/SupaSafe-Showcase-blue?style=for-the-badge" alt="SupaSafe Showcase" />
  </a>
</div>

## ✨ Key Features

- **End-to-End Encryption**: AES-256 encryption for all stored credentials
- **Zero-Knowledge Architecture**: Your master password never leaves your device
- **Intuitive User Experience**: Simple yet powerful interface for managing your digital life
- **Cross-Platform Access**: Secure your passwords across all your devices
- **Password Health Analysis**: Identify weak or compromised passwords
- **Secure Password Generator**: Create strong, unique passwords with ease

## 🔐 Security Architecture

SupaSafe employs a robust security model:

1. **User Authentication**
   - bcrypt password hashing with individual salts
   - JWT-based authentication with encrypted payload
   
2. **Password Encryption**
   - AES-256 encryption for all stored credentials
   - Unique initialization vectors (IV) for each password
   - Master key derived using PBKDF2 key stretching

3. **Secure Architecture**
   - Zero-knowledge design
   - Forward secrecy implementation
   - Regular security audits

## System Design
<div align="center">
  <img src="/Docs/System Design Diagrams/HighLevel System OverView.png" alt="System Architecture" />
</div>


## PipeLine

<div align="center">
  <img src="/Docs/System Design Diagrams/PipeLine.png" alt="Pipeline Diagram" />
</div>

## ERD
<div align="center">
  <img src="/Docs/Database Design-Schema/ERD.png" alt="ERD" />
</div>

## Database Schema
<div align="center">
  <img src="/Docs/Database Design-Schema/Database Schema.png" alt="Database Schema" />
</div>



## 🧠 Technical Stack

### Frontend
- **React**: UI framework
- **Tailwind CSS**: Styling
- **Redux**: State management
- **Axios**: API requests

### Backend
- **Node.js**: Runtime environment
- **Express**: Web framework
- **PostgreSQL**: Database
- **Prisma**: ORM
- **JWT**: Authentication

### Security
- **crypto (Node.js)**: AES-256 encryption
- **bcrypt**: Password hashing
- **helmet**: HTTP security headers

### DevOps
- **Docker**: Containerization
- **GitHub Actions**: CI/CD
- **Jest**: Testing
- **ESLint/Prettier**: Code quality

## 📊 Project Structure

```
SupaSafe-Client/
│── client/                # Frontend React application
│   ├── public/            # Static assets
│   └── src/               # Source code
│       ├── components/    # UI components
│       ├── pages/         # Application pages
│       ├── services/      # API service layer
│       ├── utils/         # Helper utilities
│       └── store/         # Redux store
│
│── SupaSafe-Server/  # Backend Node.js application
│   ├── src/                   # Source code
│   │   ├── config/            # Configuration files
│   │   ├── controllers/       # Request handlers
│   │   ├── middleware/        # Express middleware
│   │   ├── models/            # Data models
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── utils/             # Utility functions
│   │   └── app.js             # Express application setup
│   │
│   ├── migrations/            # Database migration scripts
│   ├── tests/                 # Test suites
│   └── [configuration files]  # Package.json, .env, etc.
│
│── docker/                # Docker configuration
│── .github/workflows/     # CI/CD pipeline definitions
└── docs/                  # Documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- PostgreSQL (v13+)
- Docker (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/supasafe.git
cd supasafe

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run database migrations
npx prisma migrate dev

# Start the development server
npm run dev
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Website](https://supasafe-showcase.vercel.app/)
- [Report a Bug](https://github.com/yourusername/supasafe/issues)
- [Request a Feature](https://github.com/yourusername/supasafe/issues)

---

<div align="center">
  <p>Made with ❤️ by SupaSafe Team</p>
</div>
