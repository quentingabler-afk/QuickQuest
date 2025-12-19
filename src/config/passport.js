const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ===== GOOGLE OAUTH STRATEGY =====
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://quickquest.onrender.com/api/auth/google/callback",  // ✅ Matches Google Console
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists with this Google ID
      let user = await prisma.user.findUnique({
        where: { googleId: profile.id }
      });

      if (!user) {
        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: profile.emails[0].value }
        });

        if (existingUser) {
          // Link Google account to existing user
          user = await prisma.user.update({
            where: { id: existingUser.id },
            data: { 
              googleId: profile.id,
              isVerified: true // Google accounts are verified
            }
          });
        } else {
          // Create new user
          user = await prisma.user.create({
            data: {
              email: profile.emails[0].value,
              username: profile.emails[0].value.split('@')[0] + Math.random().toString(36).substr(2, 4),
              googleId: profile.id,
              firstName: profile.name.givenName,
              lastName: profile.name.familyName,
              avatar: profile.photos[0]?.value,
              provider: 'google',
              isVerified: true
            }
          });
        }
      }

      return done(null, user);
    } catch (error) {
      console.error('Google OAuth error:', error);
      return done(error, null);
    }
  }
));

// ===== GITHUB OAUTH STRATEGY =====
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "/api/auth/github/callback",  // ✅ Matches GitHub OAuth settings
    scope: ['user:email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Get primary email from GitHub
      const email = profile.emails?.[0]?.value;
      
      if (!email) {
        return done(new Error('No email found from GitHub'), null);
      }

      // Check if user exists with this GitHub ID
      let user = await prisma.user.findUnique({
        where: { githubId: profile.id }
      });

      if (!user) {
        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
          where: { email }
        });

        if (existingUser) {
          // Link GitHub account to existing user
          user = await prisma.user.update({
            where: { id: existingUser.id },
            data: { 
              githubId: profile.id,
              isVerified: true
            }
          });
        } else {
          // Create new user
          user = await prisma.user.create({
            data: {
              email,
              username: profile.username || email.split('@')[0] + Math.random().toString(36).substr(2, 4),
              githubId: profile.id,
              firstName: profile.displayName?.split(' ')[0],
              lastName: profile.displayName?.split(' ').slice(1).join(' '),
              avatar: profile.photos?.[0]?.value,
              provider: 'github',
              isVerified: true
            }
          });
        }
      }

      return done(null, user);
    } catch (error) {
      console.error('GitHub OAuth error:', error);
      return done(error, null);
    }
  }
));

module.exports = passport;