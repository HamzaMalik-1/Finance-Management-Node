import ApiError from './ApiError.js';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';
import logger from '../logger.js'; // Import your new winston logger

class BadRequestError extends ApiError {
  constructor(message = ReasonPhrases.BAD_REQUEST, details) {
    // Log the error message using our professional logger
    logger.warn(`BadRequest: ${message}`); 
    super(StatusCodes.BAD_REQUEST, message, details);
  }
}

class ForbiddenError extends ApiError {
  constructor(message = ReasonPhrases.FORBIDDEN, details) {
    logger.warn(`Forbidden: ${message}`);
    super(StatusCodes.FORBIDDEN, message, details);
  }
}

class NotFoundError extends ApiError {
  constructor(message = ReasonPhrases.NOT_FOUND, details) {
    logger.warn(`NotFound: ${message}`);
    super(StatusCodes.NOT_FOUND, message, details);
  }
}

class InternalServerError extends ApiError {
  constructor(message = ReasonPhrases.INTERNAL_SERVER_ERROR, details) {
    logger.error(`InternalServer: ${message}`); // Errors get the .error level
    super(StatusCodes.INTERNAL_SERVER_ERROR, message, details);
  }
}

class UnauthorizedError extends ApiError {
  constructor(message = ReasonPhrases.UNAUTHORIZED, details) {
    logger.warn(`Unauthorized: ${message}`);
    super(StatusCodes.UNAUTHORIZED, message, details);
  }
}

class AlreadyExist extends ApiError {
  constructor(message = ReasonPhrases.CONFLICT, details) {
    logger.warn(`Conflict: ${message}`);
    super(StatusCodes.CONFLICT, message, details);
  }
}

export {
  BadRequestError,
  InternalServerError,
  NotFoundError,
  ForbiddenError,
  UnauthorizedError,
  AlreadyExist,
};