/**
 * Global error handling middleware
 * Handles application-level errors for cloud services
 */
export function errorHandler(err, req, res, next) {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Database connection errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
    return res.status(503).json({
      success: false,
      error: 'Database service temporarily unavailable. Please try again later.',
      statusCode: 503
    });
  }

  // Database query errors
  if (err.code && err.code.startsWith('ER_')) {
    return res.status(500).json({
      success: false,
      error: 'Database operation failed',
      statusCode: 500,
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // S3/Cloud storage errors
  if (err.message && err.message.includes('Cloud storage')) {
    return res.status(503).json({
      success: false,
      error: err.message,
      statusCode: 503
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: err.message,
      statusCode: 400
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Authentication failed',
      statusCode: 401
    });
  }

  // Default error response
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    statusCode: err.statusCode || 500,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}

/**
 * Async error wrapper
 * Catches errors in async route handlers
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export default { errorHandler, asyncHandler };
