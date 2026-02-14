import express from "express";
const app = express();
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import errorHandler from "./middlewares/errorHandler.js";
import setupSwagger from "./config/swagger.js";
import i18n from "./config/i18n.js";
import middleware from "i18next-http-middleware";
// const { InternalServerError } = require('./utils/ErrorHelpers/Errors');

// Middleware
app.use(express.json({ limit: "5mb" }));
app.use(helmet());
app.use(cors({ 
  origin: '*',
  credentials: true 
}));
app.use(express.urlencoded());
app.use(middleware.handle(i18n));
setupSwagger(app);

// import authRouter from './routes/authRoutes.js'
// import productRouter from './routes/productRoutes.js'
import v1AuthRouter from "./routes/v1/authRoutes.js";
import v1RoleRouter from "./routes/v1/roleRoutes.js";
import v1UserRouter from "./routes/v1/userRoutes.js";
import v1AccountRouter from "./routes/v1/accountRoutes.js";
import v1BudgetRouter from "./routes/v1/budgetRoutes.js";
import v1TransactionRouter from "./routes/v1/transactionRoutes.js";
import v1DebtRouter from "./routes/v1/debtRoutes.js";
import v1ConstantRouter from "./routes/v1/constantRoutes.js";
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
  message: "❌ Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

// Apply to all routes
app.use(limiter);
app.use(hpp());

// app.use('/api/auth',authRouter)
// app.use('/api/product',productRouter)
app.use("/api/v1/auth", v1AuthRouter);
app.use("/api/v1/role", v1RoleRouter);
app.use("/api/v1/user", v1UserRouter);
app.use("/api/v1/user-account", v1AccountRouter);
app.use("/api/v1/budget", v1BudgetRouter);
app.use("/api/v1/transaction", v1TransactionRouter);
app.use("/api/v1/dept", v1DebtRouter);
app.use("/api/v1/constant", v1ConstantRouter);
// Routes
app.get("/", (req, res) => {
  res.send("Server is working!");
});
app.use(errorHandler);
export default app;
