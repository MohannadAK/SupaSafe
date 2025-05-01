const { Sequelize } = require('sequelize');
require('dotenv').config();

async function testSupabaseConnection() {
  console.log('=== SUPABASE CONNECTION TEST ===');
  console.log('Connection parameters:');
  console.log(`  Host: ${process.env.DB_HOST}`);
  console.log(`  Port: ${process.env.DB_PORT}`);
  console.log(`  Database: ${process.env.DB_NAME}`);
  console.log(`  User: ${process.env.DB_USER}`);
  console.log(`  Password length: ${process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 0} characters`);
  console.log('-----------------------------------');

  // Create a sequelize instance with detailed logging
  const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    logging: false, // Disable query logging for cleaner output
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
      connectTimeout: 30000, // 30 seconds timeout
    },
  });

  try {
    console.log('Attempting to connect...');
    await sequelize.authenticate();
    console.log('✅ CONNECTION SUCCESSFUL');
    
    // Test a simple query to verify we have basic permissions
    console.log('\nTesting database access with a simple query...');
    const [results] = await sequelize.query('SELECT current_database() as db, current_user as user');
    console.log(`Connected as user "${results[0].user}" to database "${results[0].db}"`);
    
    // Check for tables
    console.log('\nChecking for existing tables...');
    const [tables] = await sequelize.query(
      'SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\''
    );
    
    if (tables.length === 0) {
      console.log('No tables found in the public schema (this is normal for a new project)');
    } else {
      console.log(`Found ${tables.length} tables:`);
      tables.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    }
    
    console.log('\n✅ Database connection and basic permissions verified successfully');
    return true;
  } catch (error) {
    console.log('\n❌ CONNECTION FAILED');
    console.log('\nDetailed error information:');
    console.log('-----------------------------------');
    console.log(`Error name: ${error.name}`);
    console.log(`Error message: ${error.message}`);
    
    // Check for common error patterns
    if (error.message.includes('password authentication failed')) {
      console.log('\n🔍 DIAGNOSIS: Password authentication failed');
      console.log('Possible solutions:');
      console.log('1. Check if your DB_PASSWORD in .env is correct');
      console.log('2. Verify you\'re using the PostgreSQL password from Supabase dashboard');
      console.log('3. Make sure you\'re not using your Supabase account password instead of the database password');
    } 
    else if (error.message.includes('ENOTFOUND')) {
      console.log('\n🔍 DIAGNOSIS: Host not found');
      console.log('Possible solutions:');
      console.log('1. Check if your DB_HOST value is correct');
      console.log('2. Make sure you\'re using the hostname without "https://"');
      console.log('3. Verify you can ping the host from your machine');
    }
    else if (error.message.includes('ETIMEDOUT')) {
      console.log('\n🔍 DIAGNOSIS: Connection timeout');
      console.log('Possible solutions:');
      console.log('1. Check if your network blocks outgoing PostgreSQL connections (port 5432)');
      console.log('2. Verify your Supabase project settings allow direct database connections');
      console.log('3. Try connecting through a PostgreSQL client to validate credentials');
    }
    else if (error.message.includes('certificate')) {
      console.log('\n🔍 DIAGNOSIS: SSL/TLS issue');
      console.log('Possible solutions:');
      console.log('1. Make sure SSL is properly configured in your connection options');
      console.log('2. Try setting rejectUnauthorized: false in your SSL options');
    }
    else {
      console.log('\n🔍 DIAGNOSIS: Unknown connection issue');
      console.log('Possible solutions:');
      console.log('1. Verify all connection parameters');
      console.log('2. Check if your Supabase project is active and not in maintenance mode');
      console.log('3. Try connecting with a PostgreSQL client like pgAdmin or psql');
    }
    
    // Print more diagnostic info from error object if available
    if (error.parent) {
      console.log('\nAdditional error details:');
      console.log(`Parent error: ${error.parent.message}`);
    }
    
    console.log('\n-----------------------------------');
    console.log('NEXT STEPS:');
    console.log('1. Fix the identified issues');
    console.log('2. Run this test script again');
    console.log('3. If still failing, try connecting with psql or pgAdmin to isolate the issue');
    console.log(`   Command for direct psql connection: psql "postgres://postgres:${process.env.DB_PASSWORD ? '[PASSWORD]' : 'missing_password'}@${process.env.DB_HOST}:${process.env.DB_PORT}/postgres?sslmode=require"`);
    
    return false;
  } finally {
    try {
      // Close the connection
      await sequelize.close();
    } catch (err) {
      // Ignore close errors
    }
  }
}

// Run the test
testSupabaseConnection()
  .then((success) => {
    if (!success) {
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error('Unexpected error running the test script:', err);
    process.exit(1);
  });
