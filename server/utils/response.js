// server/utils/response.js

/**
 * Send a success response with consistent JSON envelope
 * @param {Object} res - Express response object
 * @param {*} data - Data to send in response
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {string} message - Optional success message
 */
function sendSuccess(res, data = null, statusCode = 200, message = null) {
  const response = {
    success: true,
    data
  };
  
  if (message) {
    response.message = message;
  }
  
  return res.status(statusCode).json(response);
}

/**
 * Send an error response with consistent JSON envelope
 * @param {Object} res - Express response object
 * @param {string} error - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {*} data - Optional data to include in error response
 */
function sendError(res, error, statusCode = 500, data = null) {
  const response = {
    success: false,
    error
  };
  
  if (data !== null) {
    response.data = data;
  }
  
  return res.status(statusCode).json(response);
}

module.exports = {
  sendSuccess,
  sendError
};
