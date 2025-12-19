const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const prisma = require('../config/database');
const { generateToken } = require('../utils/jwt');
const { sendVerificationEmail, sendWelcomeEmail } = require('../utils/email');
const { generateVerificationToken } = require('../utils/tokens');

const SALT_ROUNDS = 12; // bcrypt salt rounds for password hashing

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email, username, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(400).json({
          success: false,
          message: 'Email is already registered',
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Username is already taken',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Generate verification token
    const { token: verificationToken, expires: verificationTokenExpires } = generateVerificationToken();

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password: hashedPassword,
        verificationToken,
        verificationTokenExpires,
      },
      select: {
        id: true,
        email: true,
        username: true,
        isPro: true,
        isVerified: true,
        createdAt: true,
      },
    });

    // Send verification email
    try {
      await sendVerificationEmail(user.email, verificationToken, user.username);
      console.log(`✅ Verification email sent to ${user.email}`);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail registration if email fails
    }

    // Generate JWT token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Please check your email to verify your account.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          isPro: user.isPro,
          isVerified: user.isVerified,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create account. Please try again.',
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          isPro: user.isPro,
          isVerified: user.isVerified,
          avatar: user.avatar,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to login. Please try again.',
    });
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 * Requires authentication
 */
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        bio: true,
        isPro: true,
        isVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
    });
  }
};

/**
 * Verify email address
 * GET /api/auth/verify-email/:token
 */
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Find user with this token
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpires: {
          gte: new Date(), // Token not expired
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token',
      });
    }

    // Update user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpires: null,
      },
    });

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.username);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now sign in.',
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify email',
    });
  }
};

/**
 * Request password reset
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res) => {
  try {
    console.log('🔵 forgotPassword called');
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email } = req.body;
    console.log('🔵 Looking for user with email:', email);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success (don't reveal if email exists)
    if (!user) {
      console.log('⚠️ User not found for email:', email);
      return res.status(200).json({
        success: true,
        message: 'If that email is registered, you will receive a password reset link shortly.',
      });
    }

    console.log('✅ User found:', user.username);

    // Generate reset token
    const { token: resetToken, expires: resetExpires } = require('../utils/tokens').generateResetToken();
    console.log('🔵 Generated reset token');

    // Save token to user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      },
    });
    console.log('✅ Token saved to database');

    // Send password reset email
    console.log('🔵 About to call sendPasswordResetEmail...');
    try {
      const { sendPasswordResetEmail } = require('../utils/email');
      await sendPasswordResetEmail(user.email, resetToken, user.username);
      console.log('✅ sendPasswordResetEmail completed successfully');
    } catch (emailError) {
      console.error('❌ Failed to send password reset email:', emailError);
      console.error('❌ Error details:', emailError.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to send password reset email',
      });
    }

    res.status(200).json({
      success: true,
      message: 'If that email is registered, you will receive a password reset link shortly.',
    });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request',
    });
  }
};

/**
 * Reset password with token
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { token, password } = req.body;

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gte: new Date(), // Token not expired
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully! You can now sign in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
    });
  }
};

/**
 * Resend verification email
 * POST /api/auth/resend-verification
 */
const resendVerification = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with that email',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'This account is already verified',
      });
    }

    // Generate new verification token
    const { token: verificationToken, expires: verificationTokenExpires } = generateVerificationToken();

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationTokenExpires,
      },
    });

    // Send verification email
    try {
      await sendVerificationEmail(user.email, verificationToken, user.username);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Verification email sent! Please check your inbox.',
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification email',
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  verifyEmail,
  forgotPassword,
  resetPassword,
  resendVerification,
};
