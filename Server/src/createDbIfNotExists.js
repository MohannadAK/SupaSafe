const { Sequelize } = require('sequelize');
const process = require('process');
const fs = require('fs');
const path = require('path');

// Load configuration from config.js
const config = require(path.resolve(__dirname, './config/config.json'));
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Initialize a Sequelize instance connected to the default postgres database
const sequelize = new Sequelize({
    username: dbConfig.username,
    password: dbConfig.password,
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    database: 'postgres' // Connect to default postgres database first
});

// Function to create the database if it does not exist
async function createDatabaseIfNotExists() {
    try {
        console.log('Connecting to PostgreSQL server...');
        await sequelize.authenticate();
        console.log('Connection established successfully.');

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

        // Test connection to the newly created database
        console.log('Testing connection to the database...');
        const testConnection = new Sequelize({
            username: dbConfig.username,
            password: dbConfig.password,
            host: dbConfig.host,
            port: dbConfig.port,
            dialect: dbConfig.dialect,
            database: dbConfig.database
        });

        await testConnection.authenticate();
        console.log(`Connection to ${dbConfig.database} established successfully.`);
        await testConnection.close();
        
    } catch (error) {
        console.error('Error checking or creating the database:', error);
        process.exit(1);
    } finally {
        // Close the connection
        await sequelize.close();
        console.log('Initial connection closed.');
    }
}

// Run the script
createDatabaseIfNotExists()
    .then(() => {
        console.log('Database setup completed.');
        process.exit(0);
    })
    .catch(err => {
        console.error('Unexpected error:', err);
        process.exit(1);
    });