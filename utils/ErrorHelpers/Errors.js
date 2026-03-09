import ApiError from './ApiError.js';
import { StatusCodes } from 'http-status-codes';
import logger from '../logger.js';

class BadRequestError extends ApiError {
  constructor(message = 'errors.bad_request', details) {
    logger.warn(`BadRequest: ${message}`); 
    super(StatusCodes.BAD_REQUEST, message, details);
  }
}

class ForbiddenError extends ApiError {
  constructor(message = 'errors.forbidden', details) {
    logger.warn(`Forbidden: ${message}`);
    super(StatusCodes.FORBIDDEN, message, details);
  }
}

class NotFoundError extends ApiError {
  constructor(message = 'errors.not_found', details) {
    logger.warn(`NotFound: ${message}`);
    super(StatusCodes.NOT_FOUND, message, details);
  }
}

class InternalServerError extends ApiError {
  constructor(message = 'errors.internal_server_error', details) {
    logger.error(`InternalServer: ${message}`);
    super(StatusCodes.INTERNAL_SERVER_ERROR, message, details);
  }
}

class UnauthorizedError extends ApiError {
  constructor(message = 'errors.unauthorized', details) {
    logger.warn(`Unauthorized: ${message}`);
    super(StatusCodes.UNAUTHORIZED, message, details);
  }
}

class AlreadyExist extends ApiError {
  constructor(message = 'errors.already_exists', details) {
    logger.warn(`Conflict: ${message}`);
    super(StatusCodes.CONFLICT, message, details);
  }
}

class CreationError extends ApiError{
  constructor(message="error.creation_error",details)
  {
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
  CreationError
};