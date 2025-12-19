const { verifyToken } = require('../utils/jwt');

/**
 * Middleware to authenticate requests using JWT
 * Adds user data to req.user if token is valid
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Please sign in.',
      });
    }

    // Extract token (remove "Bearer " prefix)
    const token = authHeader.substring(7);

    // Verify token
    const decoded = verifyToken(token);

    // Attach user data to request
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please sign in again.',
    });
  }
};

/**
 * Middleware to check if user has Pro subscription
 */
const requirePro = (req, res, next) => {
  if (!req.user.isPro) {
    return res.status(403).json({
      success: false,
      message: 'This feature requires a Pro subscription.',
    });
  }
  next();
};

module.exports = {
  authenticate,
  requirePro,
};
