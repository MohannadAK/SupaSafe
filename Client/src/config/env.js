// Environment variables configuration
const env = {
  // API configuration
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api',
  
  // Authentication settings
  TOKEN_EXPIRY_DAYS: parseInt(process.env.REACT_APP_TOKEN_EXPIRY_DAYS || '7', 10),
  
  // Feature flags
  ENABLE_PASSWORD_GENERATOR: process.env.REACT_APP_ENABLE_PASSWORD_GENERATOR !== 'false',
  ENABLE_EXPORT_IMPORT: process.env.REACT_APP_ENABLE_EXPORT_IMPORT !== 'false',
  
  // Environment detection
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_TEST: process.env.NODE_ENV === 'test',
  
  // Helper method to check if we're in a specific environment
  isEnv: (environment) => process.env.NODE_ENV === environment,
};

export default env; 