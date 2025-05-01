const { Sequelize } = require('sequelize');
const process = require('process');
const fs = require('fs');
const path = require('path');

// Load configuration from config.js
const config = require(path.resolve(__dirname, './config/config.json'));
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Initialize a Sequelize instance without specifying the database
const sequelize = new Sequelize({
    username: dbConfig.username,
    password: dbConfig.password,
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
});

// Function to create the database if it does not exist
async function createDatabaseIfNotExists() {
    try {
        // Check if the database exists
        const [results] = await sequelize.query(`SELECT 1 FROM pg_database WHERE datname = '${dbConfig.database}'`);

        if (results.length === 0) {
            // Database doesn't exist, so create it
            console.log(`Database ${dbConfig.database} not found. Creating it now...`);
            await sequelize.query(`CREATE DATABASE "${dbConfig.database}"`);
            console.log(`Database ${dbConfig.database} created successfully.`);
        } else {
            console.log(`Database ${dbConfig.database} already exists.`);
        }
    } catch (error) {
        console.error('Error checking or creating the database:', error);
    } finally {
        // Close the connection
        await sequelize.close();
    }
}

// Run the script
createDatabaseIfNotExists();
