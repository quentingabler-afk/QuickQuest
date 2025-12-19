const { generateToken } = require('../utils/jwt');

// Get the frontend URL without trailing slash
const getFrontendUrl = () => {
  const url = process.env.FRONTEND_URL || 'http://localhost:3000';
  // If URL doesn't end with .html, add the HTML filename
  if (!url.endsWith('.html')) {
    return `${url}/quickquest-enhanced.html`;
  }
  return url;
};

/**
 * Google OAuth callback
 * GET /api/auth/google/callback
 */
const googleCallback = (req, res) => {
  try {
    // User is attached to req by Passport
    const user = req.user;

    // Generate JWT token
    const token = generateToken(user);

    // Redirect to frontend with token
    const frontendUrl = getFrontendUrl();
    res.redirect(`${frontendUrl}?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: user.id,
      email: user.email,
      username: user.username,
      isPro: user.isPro,
      isVerified: user.isVerified,
      avatar: user.avatar,
      firstName: user.firstName,
      lastName: user.lastName,
    }))}`);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    const frontendUrl = getFrontendUrl();
    res.redirect(`${frontendUrl}?error=oauth_failed`);
  }
};

/**
 * GitHub OAuth callback
 * GET /api/auth/github/callback
 */
const githubCallback = (req, res) => {
  try {
    // User is attached to req by Passport
    const user = req.user;

    // Generate JWT token
    const token = generateToken(user);

    // Redirect to frontend with token
    const frontendUrl = getFrontendUrl();
    res.redirect(`${frontendUrl}?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: user.id,
      email: user.email,
      username: user.username,
      isPro: user.isPro,
      isVerified: user.isVerified,
      avatar: user.avatar,
      firstName: user.firstName,
      lastName: user.lastName,
    }))}`);
  } catch (error) {
    console.error('GitHub OAuth callback error:', error);
    const frontendUrl = getFrontendUrl();
    res.redirect(`${frontendUrl}?error=oauth_failed`);
  }
};

module.exports = {
  googleCallback,
  githubCallback,
};
