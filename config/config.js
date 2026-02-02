import dotenv from 'dotenv'
dotenv.config();


const config = {
  development: {
    PORT: process.env.PORT || 3000,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 6543,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Changed to false for Supabase compatibility
      }
    },
    sendGridApiKey: process.env.SENDGRID_API_KEY,
    sendGridUsername: process.env.SENDGRID_USERNAME || 'apikey',
    email: process.env.SENDER_EMAIL,
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
    baseUrl:process.env.DEVELOPMENT_BASE_URL
  },
  production: {
    // Fill this in later when you deploy to Vercel or Render
    dialect: 'postgres',
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false }
    }
  }
};

export default process.env.NODE_ENV === 'production' ? config.production : config.development;