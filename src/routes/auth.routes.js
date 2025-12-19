const express = require('express');
const { body } = require('express-validator');
const passport = require('../config/passport');
const { register, login, getMe, verifyEmail, forgotPassword, resetPassword, resendVerification } = require('../controllers/auth.controller');
const { googleCallback, githubCallback } = require('../controllers/oauth.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('username')
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  ],
  register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  login
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private (requires authentication)
 */
router.get('/me', authenticate, getMe);

/**
 * @route   GET /api/auth/verify-email/:token
 * @desc    Verify email address
 * @access  Public
 */
router.get('/verify-email/:token', verifyEmail);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post(
  '/forgot-password',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
  ],
  forgotPassword
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post(
  '/reset-password',
  [
    body('token')
      .notEmpty()
      .withMessage('Reset token is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  ],
  resetPassword
);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend verification email
 * @access  Public
 */
router.post(
  '/resend-verification',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
  ],
  resendVerification
);

/**
 * @route   GET /api/auth/google
 * @desc    Start Google OAuth flow
 * @access  Public
 */
router.get('/google', passport.authenticate('google', { session: false }));

/**
 * @route   GET /api/auth/google/callback
 * @desc    Google OAuth callback
 * @access  Public
 */
router.get(
  '/google/callback',
  passport.authenticate('google', { 
    session: false, 
    failureRedirect: process.env.FRONTEND_URL && process.env.FRONTEND_URL.endsWith('.html') 
      ? `${process.env.FRONTEND_URL}?error=oauth_failed` 
      : `${process.env.FRONTEND_URL}/quickquest-enhanced.html?error=oauth_failed`
  }),
  googleCallback
);

/**
 * @route   GET /api/auth/github
 * @desc    Start GitHub OAuth flow
 * @access  Public
 */
router.get('/github', passport.authenticate('github', { session: false }));

/**
 * @route   GET /api/auth/github/callback
 * @desc    GitHub OAuth callback
 * @access  Public
 */
router.get(
  '/github/callback',
  passport.authenticate('github', { 
    session: false, 
    failureRedirect: process.env.FRONTEND_URL && process.env.FRONTEND_URL.endsWith('.html') 
      ? `${process.env.FRONTEND_URL}?error=oauth_failed` 
      : `${process.env.FRONTEND_URL}/quickquest-enhanced.html?error=oauth_failed`
  }),
  githubCallback
);

module.exports = router;
