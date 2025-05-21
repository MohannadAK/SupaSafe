const express = require('express');
const path = require('path');
const app = require('./app');
const { sequelize } = require('./models');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerJSDoc = require('swagger-jsdoc');

// TEMPORARY DEBUG: Print PGPASSWORD environment variable (REMOVE THIS AFTER DEBUGGING)
console.log('DEBUG (Server Init): PGPASSWORD environment variable:', process.env.PGPASSWORD);
console.log('DEBUG (Server Init): PGDATABASE environment variable:', process.env.PGDATABASE);
console.log('DEBUG (Server Init): PGUSER environment variable:', process.env.PGUSER);
console.log('DEBUG (Server Init): PGHOST environment variable:', process.env.PGHOST);
console.log('DEBUG (Server Init): PGPORT environment variable:', process.env.PGPORT);
console.log('------------------------------------------------------');

// Load environment variables from .env file in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Log the static file path for debugging
const staticPath = '/app/client/build';
console.log('Serving static files from:', staticPath);
app.use(express.static(staticPath));

// Serve Swagger API docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Fallback for React (for SPA routing)
app.get('*', (req, res) => {
  console.log('Attempting to serve index.html for:', req.url);
  res.sendFile('/app/client/build/index.html', (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).send('Error serving index.html');
    }
  });
});

// Start the server
const PORT = process.env.PORT;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    await sequelize.sync({ force: false });
    console.log('Database synced');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();
