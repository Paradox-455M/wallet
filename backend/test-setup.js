#!/usr/bin/env node

const dotenv = require('dotenv');
const { query } = require('./src/config/db');

// Load environment variables
dotenv.config();

async function testSetup() {
  console.log('🧪 Testing Backend Setup...\n');

  // Test 1: Environment Variables
  console.log('1. Checking Environment Variables...');
  const requiredEnvVars = [
    'DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD',
    'JWT_SECRET', 'SESSION_SECRET'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log('❌ Missing environment variables:', missingVars.join(', '));
    console.log('   Please check your .env file\n');
  } else {
    console.log('✅ All required environment variables are set\n');
  }

  // Test 2: Database Connection
  console.log('2. Testing Database Connection...');
  try {
    const result = await query('SELECT NOW() as current_time');
    console.log('✅ Database connection successful');
    console.log(`   Current time: ${result.rows[0].current_time}\n`);
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    console.log('   Please check your database configuration\n');
    return;
  }

  // Test 3: Check Tables
  console.log('3. Checking Database Tables...');
  try {
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    const tables = tablesResult.rows.map(row => row.table_name);
    const expectedTables = ['users', 'transactions'];
    
    console.log('   Found tables:', tables.join(', '));
    
    const missingTables = expectedTables.filter(table => !tables.includes(table));
    if (missingTables.length > 0) {
      console.log('❌ Missing tables:', missingTables.join(', '));
      console.log('   Run the server once to create tables automatically\n');
    } else {
      console.log('✅ All required tables exist\n');
    }
  } catch (error) {
    console.log('❌ Error checking tables:', error.message, '\n');
  }

  // Test 4: Optional Services
  console.log('4. Checking Optional Service Configuration...');
  
  const optionalServices = [
    { name: 'Stripe', vars: ['STRIPE_SECRET_KEY'] },
    { name: 'AWS S3', vars: ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_BUCKET_NAME'] },
    { name: 'Google OAuth', vars: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'] },
    { name: 'GitHub OAuth', vars: ['GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET'] }
  ];

  optionalServices.forEach(service => {
    const hasAllVars = service.vars.every(varName => process.env[varName]);
    if (hasAllVars) {
      console.log(`✅ ${service.name} is configured`);
    } else {
      console.log(`⚠️  ${service.name} is not configured (optional)`);
    }
  });

  console.log('\n🎉 Backend setup test completed!');
  console.log('\nNext steps:');
  console.log('1. Fix any issues shown above');
  console.log('2. Run "npm run dev" to start the development server');
  console.log('3. Test the API endpoints with your frontend or Postman');
  
  process.exit(0);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Run the test
testSetup().catch(error => {
  console.error('❌ Setup test failed:', error);
  process.exit(1);
});