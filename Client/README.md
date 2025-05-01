# Secure Password Manager - API Integration Guide

This document provides guidance on how to integrate the password manager application with a backend API. It outlines all the API integration points, how to set up the base URL, and how to implement each API call.

## Table of Contents

- [Setting Up API Configuration](#setting-up-api-configuration)
- [Authentication APIs](#authentication-apis)
  - [Login](#login)
  - [Registration](#registration)
  - [Logout](#logout)
- [Password Management APIs](#password-management-apis)
  - [Fetch Passwords](#fetch-passwords)
  - [Add Password](#add-password)
  - [Update Password](#update-password)
  - [Delete Password](#delete-password)
- [User Account APIs](#user-account-apis)
  - [Get User Profile](#get-user-profile)
  - [Change Master Password](#change-master-password)
  - [Delete Account](#delete-account)
- [Token Management](#token-management)
- [Error Handling](#error-handling)
- [Deploying to Vercel](#deploying-to-vercel)

## Setting Up API Configuration

Create a new file `src/config/api.js` to centralize your API configuration:

```javascript
// Base API URL - change this to your actual backend URL
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.yourpasswordmanager.com/v1';

// API endpoints
export const ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  
  // Password endpoints
  PASSWORDS: '/passwords',
  PASSWORD: (id) => `/passwords/${id}`,
  
  // User endpoints
  USER_PROFILE: '/user/profile',
  CHANGE_PASSWORD: '/user/change-password',
  DELETE_ACCOUNT: '/user/delete-account',
};

// Helper function to build full API URLs
export const getApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;

// API request headers with authentication
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Centralized fetch wrapper with error handling
export const apiRequest = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  
  // Default options
  const defaultOptions = {
    headers: getAuthHeaders(),
  };
  
  // Merge options
  const fetchOptions = {
    ...defaultOptions,
    ...options,
  };
  
  try {
    const response = await fetch(url, fetchOptions);
    
    // Handle non-2xx responses
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'API request failed');
    }
    
    // Parse JSON response
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};
```

## Authentication APIs

### Login

**Location:** `src/components/LoginForm.js` (line 13-25)

```javascript
import { apiRequest, ENDPOINTS } from '../config/api';

// Inside handleSubmit function:
try {
  const response = await apiRequest(ENDPOINTS.LOGIN, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  if (response.success) {
    localStorage.setItem('token', response.token);
    localStorage.setItem('userEmail', email);
    onLogin(email, password);
  } else {
    throw new Error(response.message || 'Authentication failed');
  }
} catch (error) {
  console.error('Login error:', error);
  setError(error.message);
  setIsLoading(false);
}
```

### Registration

**Location:** `src/components/RegisterForm.js` (line 19-31)

```javascript
import { apiRequest, ENDPOINTS } from '../config/api';

// Inside handleSubmit function:
try {
  const response = await apiRequest(ENDPOINTS.REGISTER, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  if (response.success) {
    localStorage.setItem('token', response.token);
    localStorage.setItem('userEmail', email);
    onRegister(email, password);
  } else {
    throw new Error(response.message || 'Registration failed');
  }
} catch (error) {
  console.error('Registration error:', error);
  setError(error.message || 'Registration failed');
  setIsLoading(false);
}
```

### Logout

**Location:** `src/App.js` (in handleLogout function)

```javascript
import { apiRequest, ENDPOINTS } from './config/api';

// Function to handle logout
const handleLogout = async () => {
  try {
    // Notify the server (if tracking sessions)
    await apiRequest(ENDPOINTS.LOGOUT, {
      method: 'POST',
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always clear local storage even if API call fails
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
  }
};
```

## Password Management APIs

### Fetch Passwords

**Location:** `src/pages/Dashboard.js` (line 48-62)

```javascript
import { apiRequest, ENDPOINTS } from '../config/api';

// Inside useEffect:
const fetchPasswords = async () => {
  try {
    setIsLoading(true);
    const data = await apiRequest(ENDPOINTS.PASSWORDS);
    setPasswords(data.passwords);
  } catch (error) {
    console.error('Error fetching passwords:', error);
    // Optionally show an error message to the user
  } finally {
    setIsLoading(false);
  }
};

fetchPasswords();
```

### Add Password

**Location:** `src/pages/Dashboard.js` (line 128-146)

```javascript
import { apiRequest, ENDPOINTS } from '../config/api';

// Inside handleAddPassword function:
const createPassword = async (passwordData) => {
  try {
    const data = await apiRequest(ENDPOINTS.PASSWORDS, {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
    
    setPasswords([...passwords, data.password]);
    setShowAddModal(false);
  } catch (error) {
    console.error('Error creating password:', error);
    alert('Failed to create password. Please try again.');
  }
};

createPassword(newPassword);
```

### Update Password

**Location:** `src/pages/Dashboard.js` (line 169-189)

```javascript
import { apiRequest, ENDPOINTS } from '../config/api';

// Inside handleEditPassword function:
const updatePassword = async (passwordData) => {
  try {
    const data = await apiRequest(ENDPOINTS.PASSWORD(passwordData.id), {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
    
    setPasswords(
      passwords.map((password) => 
        password.id === data.password.id ? data.password : password
      )
    );
    setShowEditModal(false);
    setActiveDropdown(null);
  } catch (error) {
    console.error('Error updating password:', error);
    alert('Failed to update password. Please try again.');
  }
};

updatePassword(updatedPassword);
```

### Delete Password

**Location:** `src/pages/Dashboard.js` (line 214-232)

```javascript
import { apiRequest, ENDPOINTS } from '../config/api';

// Inside handleDeletePassword function:
const deletePassword = async (passwordId) => {
  try {
    await apiRequest(ENDPOINTS.PASSWORD(passwordId), {
      method: 'DELETE',
    });
    
    setPasswords(passwords.filter(password => password.id !== passwordId));
    setActiveDropdown(null);
  } catch (error) {
    console.error('Error deleting password:', error);
    alert('Failed to delete password. Please try again.');
  }
};

deletePassword(id);
```

## User Account APIs

### Get User Profile

**Location:** `src/pages/AccountSettings.js` (line 16-28)

```javascript
import { apiRequest, ENDPOINTS } from '../config/api';

// Inside useEffect:
const fetchUserProfile = async () => {
  try {
    const data = await apiRequest(ENDPOINTS.USER_PROFILE);
    setEmail(data.user.email);
  } catch (error) {
    console.error('Error fetching user profile:', error);
  }
};

fetchUserProfile();
```

### Change Master Password

**Location:** `src/pages/AccountSettings.js` (line 60-83)

```javascript
import { apiRequest, ENDPOINTS } from '../config/api';

// Inside handlePasswordChange function:
try {
  await apiRequest(ENDPOINTS.CHANGE_PASSWORD, {
    method: 'POST',
    body: JSON.stringify({
      currentPassword,
      newPassword,
    }),
  });
  
  setSuccess('Master password has been updated successfully');
  setCurrentPassword('');
  setNewPassword('');
  setConfirmPassword('');
} catch (error) {
  console.error('Error changing password:', error);
  setError(error.message || 'Failed to change password. Please check your current password and try again.');
} finally {
  setIsLoading(false);
}
```

### Delete Account

**Location:** `src/pages/AccountSettings.js` (line 96-119)

```javascript
import { apiRequest, ENDPOINTS } from '../config/api';

// Inside handleDeleteAccount function:
try {
  await apiRequest(ENDPOINTS.DELETE_ACCOUNT, {
    method: 'DELETE',
  });
  
  // Clear local storage and log out
  localStorage.removeItem('userEmail');
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('passwords');
  localStorage.removeItem('token');
  
  // Redirect to login page
  onLogout();
  navigate('/');
} catch (error) {
  console.error('Error deleting account:', error);
  setError(error.message || 'Failed to delete account. Please try again.');
  setIsLoading(false);
}
```

## Token Management

The application uses token-based authentication. When a user logs in or registers, the server should return a JWT token that is stored in localStorage and used for subsequent requests.

**Token Storage:**
```javascript
// Store token after login/registration
localStorage.setItem('token', response.token);

// Remove token on logout
localStorage.removeItem('token');
```

**Token Usage:**
The `getAuthHeaders` function in `api.js` automatically includes the token in the Authorization header for all requests:

```javascript
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};
```

## Error Handling

The application includes centralized error handling in the `apiRequest` function, which:

1. Checks if the response is successful (status 200-299)
2. Parses error messages from the API response if available
3. Logs errors to the console
4. Throws errors to be caught by the component

Components should implement try/catch blocks around API calls to handle errors appropriately, such as:
- Displaying error messages to users
- Retrying failed requests
- Redirecting to login on authentication errors

## API Response Format

Your backend API should return responses in a consistent format:

**Success response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error response:**
```json
{
  "success": false,
  "message": "Error message here",
  "errors": [...]  // Optional detailed errors
}
```

## Development Environment

For development, you can set the API base URL in a `.env` file:

```
REACT_APP_API_BASE_URL=http://localhost:8000/api
```

This allows you to switch between development, staging, and production environments without changing the code.

## Deploying to Vercel

Follow these steps to deploy your password manager application to Vercel:

### Prerequisites

1. Create a [Vercel account](https://vercel.com/signup) if you don't have one
2. Install the Vercel CLI (optional but recommended):
   ```
   npm install -g vercel
   ```

### Deployment Steps

#### Option 1: Deploy using Vercel CLI

1. Make sure your project is in a Git repository (GitHub, GitLab, or Bitbucket)
2. Open a terminal in your project root directory
3. Run the Vercel CLI command:
   ```
   vercel
   ```
4. Follow the CLI prompts to link your project to Vercel
5. Set up environment variables for your API endpoints (if applicable)

#### Option 2: Deploy via Vercel Dashboard

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Go to the [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your repository
5. Configure the following settings:
   - **Framework Preset**: React
   - **Build Command**: `npm run build` (or your custom build command)
   - **Output Directory**: `build`
   - **Environment Variables**: Add any necessary environment variables (like `REACT_APP_API_BASE_URL`)
6. Click "Deploy"

### Environment Variables

Make sure to set up the following environment variables in your Vercel project settings:

- `REACT_APP_API_BASE_URL`: Your backend API URL (e.g., https://api.yourpasswordmanager.com/v1)

### Post-Deployment

After deployment:

1. Verify that your application is working correctly in the production environment
2. Set up custom domains if desired (via Vercel dashboard → Project → Settings → Domains)
3. Configure additional security headers in `vercel.json` if needed:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
        }
      ]
    }
  ]
}
```

### Continuous Deployment

Vercel automatically sets up continuous deployment from your Git repository. Any changes pushed to your main branch will trigger a new deployment.

To set up preview deployments for pull requests:
1. Go to Vercel dashboard → Project → Settings → Git
2. Enable "Preview Deployments" 