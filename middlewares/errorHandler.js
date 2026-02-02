import { ValidationError, UniqueConstraintError } from "sequelize";
import ApiError from "../utils/ErrorHelpers/ApiError.js";
import logger from "../utils/logger.js"; // Integrated Winston Logger
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
  ForbiddenError,
  UnauthorizedError,
  AlreadyExist,
} from "../utils/ErrorHelpers/Errors.js";

const errorHandler = (err, req, res, next) => {
  // Industry Standard: Use logger instead of console.log
  // We log the error stack for debugging in logs/error.log
  logger.error(`${err.name}: ${err.message} \nStack: ${err.stack}`);

  const success = false;
  let message = "";
  let statusCode = 500; // default to Internal Server Error

  // 1. Existing Logic for Error Identification
  if (err instanceof ValidationError) {
    message = err.errors?.[0]?.message || "Validation Error";
    statusCode = 400; // Overriding to 400 for validation
  } else if (err instanceof UniqueConstraintError) {
    message = err.errors?.[0]?.message || "Unique Constraint Error";
    statusCode = 409;
  } else if (err instanceof BadRequestError) {
    message = err.message || "Bad Request";
    statusCode = err.statusCode || 400;
  } else if (err instanceof NotFoundError) {
    message = err.message || "Not Found";
    statusCode = err.statusCode || 404;
  } else if (err instanceof ForbiddenError) {
    message = err.message || "Forbidden";
    statusCode = err.statusCode || 403;
  } else if (err instanceof UnauthorizedError) {
    message = err.message || "Unauthorized";
    statusCode = err.statusCode || 401;
  } else if (err instanceof AlreadyExist) {
    message = err.message || "Already Exists";
    statusCode = err.statusCode || 409;
  } else if (err instanceof ApiError) {
    message = err.message || "API Error";
    statusCode = err.statusCode || 500;
  } else {
    message = err.message || "Server Error";
    statusCode = 500;
  }

  // 2. Localization Implementation
  // req.t is provided by i18next-http-middleware. 
  // It translates the 'message' if it matches a key in your JSON files.
  const translatedMessage = req.t ? req.t(message) : message;

  // 3. Final Industry-Standard Response
  return res.status(statusCode).json({
    success,
    status: statusCode, // Added status code for frontend clarity
    message: translatedMessage,
    details: err.details || null,
    // Industry Practice: Only show stack trace during development (UET Environment)
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

export default errorHandler;