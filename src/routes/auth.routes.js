const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');

// ===== LOCAL AUTH ROUTES =====
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// ===== GOOGLE OAUTH ROUTES =====
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL}?error=google_auth_failed`,
    session: false 
  }),
  (req, res) => {
    // Generate JWT token
    const token = jwt.sign(
      { userId: req.user.id, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Redirect to frontend with token and user data
    const userData = encodeURIComponent(JSON.stringify({
      id: req.user.id,
      email: req.user.email,
      username: req.user.username,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      avatar: req.user.avatar,
      isVerified: req.user.isVerified,
      isPro: req.user.isPro,
      createdAt: req.user.createdAt
    }));

    res.redirect(`${process.env.FRONTEND_URL}?token=${token}&user=${userData}`);
  }
);

// ===== GITHUB OAUTH ROUTES =====
router.get('/github',
  passport.authenticate('github', { 
    scope: ['user:email'],
    session: false 
  })
);

router.get('/github/callback',
  passport.authenticate('github', { 
    failureRedirect: `${process.env.FRONTEND_URL}?error=github_auth_failed`,
    session: false 
  }),
  (req, res) => {
    // Generate JWT token
    const token = jwt.sign(
      { userId: req.user.id, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Redirect to frontend with token and user data
    const userData = encodeURIComponent(JSON.stringify({
      id: req.user.id,
      email: req.user.email,
      username: req.user.username,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      avatar: req.user.avatar,
      isVerified: req.user.isVerified,
      isPro: req.user.isPro,
      createdAt: req.user.createdAt
    }));

    res.redirect(`${process.env.FRONTEND_URL}?token=${token}&user=${userData}`);
  }
);

// ===== PROTECTED ROUTES =====
router.get('/me', authenticateToken, authController.getCurrentUser);

module.exports = router;