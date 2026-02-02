

import { Sequelize } from 'sequelize';
import config  from './config.js';
import { createClient } from '@supabase/supabase-js';

const { database, username, password, host, port } = config;
// Supabase Client (For Auth/Storage/Realtime)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY; 
const supabase = createClient(supabaseUrl, supabaseKey);

const sequelize = new Sequelize(database, username, password, {
  host,
  port: port || 6543,
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false 
    },
    keepAlive: true,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 60000, // Increased for remote cloud latency
    idle: 10000
  }
});


async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log('✅ Supabase (PostgreSQL) connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the Supabase database:', error.message);
    
    if (error.message.includes('Tenant or user not found')) {
       console.error('👉 TIP: Check if DB_HOST matches your Supabase Project Region exactly.');
    }
    process.exit(1); 
  }
}
// 
export { sequelize, connectDB, supabase };