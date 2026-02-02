require('dotenv').config();
const { Sequelize } = require('sequelize');

console.log('--- Database Connection Test ---');
console.log('Target Host:', process.env.DB_HOST);
console.log('Target User:', process.env.DB_USER);

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: console.log, // Turn on logging to see the "handshake"
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
);

async function test() {
  try {
    await sequelize.authenticate();
    console.log('✅ SUCCESS: Connection established successfully.');
  } catch (error) {
    console.error('❌ FAILURE: Error Details Below:');
    console.error('Error Name:', error.name);
    console.error('Message:', error.message);
    
    if (error.message.includes('Tenant or user not found')) {
      console.log('\n💡 HINT: The Pooler (Port 6543) does not recognize your Project ID.');
      console.log('Check if DB_USER is exactly: postgres.' + process.env.DB_HOST.split('.')[1]);
    }
  } finally {
    await sequelize.close();
    process.exit();
  }
}

test();