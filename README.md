# SupaSafe - Enterprise-Grade Password Manager


## 👥 Meet the SupaSafe Team

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

## 🌟 Overview

SupaSafe is an enterprise-grade password manager designed to provide robust security while delivering a seamless user experience. Built with modern technologies and industry-standard cryptographic practices, SupaSafe protects sensitive credentials with client-side encryption and secure key management.

### Key Highlights
- 🔒 Client-side encryption with secure key handling
- 🚀 AES-256 encryption for stored data
- 📱 Cross-platform compatibility
- 🎯 Intuitive, user-friendly interface
- 🔐 Enterprise-grade security controls
- 🌐 Scalable and extensible architecture

## ✨ Features

### Security Features
- **Client-Side Encryption**
  - AES-256-CBC encryption applied on the client before data transmission
  - Unique Initialization Vector (IV) per password entry
  - PBKDF2 key derivation on client from master password

- **Master Password Handling**
  - Master password is securely transmitted during login only
  - Server stores **no plaintext master password or encryption keys**
  - Server stores only bcrypt hash for authentication verification
  - Encryption keys derived and managed exclusively on client side

- **Authentication & Authorization**
  - JWT-based authentication with token versioning and expiration
  - bcrypt password hashing with strong salting and 12 rounds
  - Rate limiting and brute-force protection on authentication endpoints
  - Cross-device session management

- **Data Protection & Recovery**
  - Encrypted backups and secure key rotation mechanisms
  - Secure account recovery options without exposing sensitive data

### User Experience Features
- Password vault with secure storage and retrieval
- Password strength analysis and expiration management
- Secure password sharing and bulk operations
- Auto-fill and password generator with customizable options
- Two-factor authentication and activity logging

## 🛠 Technical Stack

### Frontend
- React 18.x
- Tailwind CSS and Headless UI
- React Query for data fetching
- React Hook Form for form management

### Backend
- Node.js 18.x with Express.js
- Sequelize ORM with PostgreSQL 14.x
- bcrypt, jsonwebtoken, helmet, express-rate-limit for security
- crypto-js for encryption utilities

### DevOps & Infrastructure
- Docker and Docker Compose for containerization
- GitHub Actions for CI/CD pipelines

## 📁 Project Structure
supasafe/
├── Client/ # Frontend application
│ ├── public/
│ ├── src/
│ ├── package.json
│ └── ...
├── Server/ # Backend application
│ ├── src/
│ ├── package.json
│ └── ...
├── Docs/
├── docker-compose.yml
├── Dockerfile
├── LICENSE
└── README.md

## 🔒 Security Architecture

### Master Password & Encryption Model
- Master password is transmitted securely over HTTPS during login and registration.
- The server **never stores** the plaintext master password or any derived encryption keys.
- Server stores a bcrypt hash of the master password to authenticate users.
- Encryption keys (Data Encryption Key, DEK) are derived on the client side using PBKDF2 from the master password.
- All sensitive user data (passwords, notes, etc.) is encrypted with AES-256-CBC **before** being sent to the server.

### Authentication & Session Management
- Users authenticate with credentials verified via bcrypt hashes stored on the server.
- Upon successful authentication, JWT tokens are issued with expiration and version control for secure session management.
- Rate limiting and brute-force protection guard against unauthorized access attempts.
- Cross-device session synchronization and invalidation supported.

### Data Security
- Unique IVs ensure encryption security for each password entry.
- Encrypted backups and key rotation mechanisms are supported without exposing plaintext data.

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running locally.

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Docker and Docker Compose (optional but recommended)
- PostgreSQL 14.x (if not using Docker)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/YourOrg/SupaSafe.git
cd SupaSafe
```

2. **Setup environment variables**

Create .env files in both /Client and /Server directories based on .env.example templates.

Example .env for Server:
```
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/supasafe_db
JWT_SECRET=your_jwt_secret
```

3. **Install dependencies**

For Server:
```bash
cd Server
npm install
```

For Client:

```bash
cd Client
npm install
```

4. **Run the database migrations**

Make sure your PostgreSQL database is running and configured correctly.
```bash
cd ../Server
npm run migrate
```

5. Start the development servers

In separate terminals:
```bash
# Backend
cd Server
npm run dev

# Frontend
cd ../Client
npm start
```

6. Access the app

Open http://localhost:3000 in your browser.

### Using Docker

Alternatively, use Docker Compose for easy setup:
```bash
docker-compose up --build
```

This will start PostgreSQL, Backend, and Frontend containers.
