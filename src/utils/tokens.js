const crypto = require('crypto');

/**
 * Generate a secure random token
 * @param {number} length - Token length (default: 32 bytes)
 * @returns {string} Hex token
 */
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate verification token with expiry
 * @returns {Object} Token and expiry date
 */
const generateVerificationToken = () => {
  const token = generateToken();
  const expires = new Date();
  expires.setHours(expires.getHours() + 24); // 24 hours

  return {
    token,
    expires,
  };
};

/**
 * Generate password reset token with expiry
 * @returns {Object} Token and expiry date
 */
const generateResetToken = () => {
  // Generate random 6-digit code
  const token = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  return { token, expires };
};

module.exports = {
  generateToken,
  generateVerificationToken,
  generateResetToken,
};
