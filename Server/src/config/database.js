require('dotenv').config();

// Debug logging only enabled in development
if (process.env.NODE_ENV === 'development') {
  console.log('Database configuration:', {
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_USER: process.env.DB_USER,
    DB_NAME: process.env.DB_NAME,
    DB_PASSWORD: process.env.DB_PASSWORD ? '[REDACTED]' : undefined,
  });
}

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: console.log,
    dialectOptions: {
      ssl: false,  // Local databases don't need SSL
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: false,  // Local databases don't need SSL
    },
  },
  production: {
    username: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    dialect: 'postgres',
    logging: false,
    hooks: {
      beforeConnect: (config) => {
        console.log('DEBUG: Connecting with user:', config.username);
        console.log('DEBUG: Connecting with password:', config.password);
        console.log('DEBUG: Connecting to host:', config.host);
        console.log('DEBUG: Connecting to port:', config.port);
        console.log('DEBUG: Connecting to database:', config.database);
      }
    },
    dialectOptions: {
      ssl: {
        require: true, // Enforce SSL
        rejectUnauthorized: false // This might be needed depending on Railway's SSL cert setup
      }
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
  },
};
