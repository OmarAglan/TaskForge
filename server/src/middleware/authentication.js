const jwt = require('jsonwebtoken')
const config = require('../config/config')

/**
 * Authentication middleware to verify JWT tokens
 * 
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 */
module.exports = (req, res, next) => {
  // Get token from header
  const authHeader = req.header('Authorization')
  
  // Check if no token
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'No token, authorization denied'
      }
    })
  }
  
  // Check if token format is correct
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid token format. Expected: Bearer <token>'
      }
    })
  }
  
  // Extract token without "Bearer " prefix
  const token = authHeader.substring(7)
  
  try {
    // Verify token
    const decoded = jwt.verify(token, config.authentication.jwtSecret)
    
    // Add user from payload to request object
    req.user = decoded
    
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Token expired'
        }
      })
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid token'
        }
      })
    } else {
      return res.status(500).json({
        success: false,
        error: {
          message: 'Server error during authentication'
        }
      })
    }
  }
}