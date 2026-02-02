import ApiResponse from "./ApiResponse.js";
import logger from "../logger.js"; // Import your winston logger

/**
 * Standardized function to send API responses with logging
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success or informational message
 * @param {any} data - The payload to be sent to the client
 */
const sendResponse = (res, statusCode, message, data = null) => {
  const response = new ApiResponse(statusCode, message, data);

  // Industry Standard: Log successful responses for audit trails
  // We use .info so it shows in the console and all.log
  logger.info(`Response Sent: [${statusCode}] ${message}`);

  return res.status(statusCode).json(response);
};

export default sendResponse;