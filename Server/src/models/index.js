const { Sequelize } = require('sequelize');
const dbConfig = require('../config/database')[process.env.NODE_ENV || 'development'];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    dialectOptions: dbConfig.dialectOptions,
    logging: dbConfig.logging,
    pool: dbConfig.pool
  }
);

// Import models
const User = require('./user')(sequelize);
const Password = require('./password')(sequelize);

// Define associations
User.associate({ Password });
Password.associate({ User });

// Export sequelize and models
module.exports = {
  sequelize,
  Sequelize,
  User,
  Password
};