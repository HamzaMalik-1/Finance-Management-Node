
import express  from 'express';
const app = express();
import helmet from 'helmet';
import cors from 'cors'
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import errorHandler  from './middlewares/errorHandler.js';
// const { InternalServerError } = require('./utils/ErrorHelpers/Errors');

// Middleware
app.use(express.json({ limit: '5mb' }));
app.use(helmet());
app.use(cors());
app.use(express.urlencoded());


// import authRouter from './routes/authRoutes.js'
// import productRouter from './routes/productRoutes.js'

// app.get('/', async (req, res, next) => {
//   try {
//     throw new InternalServerError("Something went wrong on the server.");
//   } catch (err) {
//     next(err); // pass to error handler middleware
//   }
// });



// Create limiter middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `windowMs`
  message: '❌ Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

// Apply to all routes
app.use(limiter);
app.use(hpp());



// app.use('/api/auth',authRouter)
// app.use('/api/product',productRouter)
// Routes
app.get('/', (req, res) => {
  res.send('Server is working!');
});
app.use(errorHandler)
export default app;