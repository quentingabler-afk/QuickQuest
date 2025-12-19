const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const prisma = require('./database');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists with this Google ID
          let user = await prisma.user.findUnique({
            where: { googleId: profile.id },
          });

          if (user) {
            // User exists, return it
            return done(null, user);
          }

          // Check if email is already registered
          const emailExists = await prisma.user.findUnique({
            where: { email: profile.emails[0].value.toLowerCase() },
          });

          if (emailExists) {
            // Link Google account to existing user
            user = await prisma.user.update({
              where: { id: emailExists.id },
              data: {
                googleId: profile.id,
                isVerified: true, // Auto-verify OAuth users
              },
            });
            return done(null, user);
          }

          // Create new user
          const username = profile.emails[0].value.split('@')[0].toLowerCase() + Math.floor(Math.random() * 1000);
          
          user = await prisma.user.create({
            data: {
              googleId: profile.id,
              email: profile.emails[0].value.toLowerCase(),
              username,
              firstName: profile.name.givenName,
              lastName: profile.name.familyName,
              avatar: profile.photos[0]?.value,
              provider: 'google',
              isVerified: true, // Auto-verify OAuth users
            },
          });

          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
}

// GitHub OAuth Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: '/api/auth/github/callback',
        scope: ['user:email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists with this GitHub ID
          let user = await prisma.user.findUnique({
            where: { githubId: profile.id },
          });

          if (user) {
            // User exists, return it
            return done(null, user);
          }

          // Get primary email from GitHub
          const email = profile.emails?.find(e => e.primary)?.value || profile.emails?.[0]?.value;
          
          if (!email) {
            return done(new Error('No email found in GitHub profile'), null);
          }

          // Check if email is already registered
          const emailExists = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
          });

          if (emailExists) {
            // Link GitHub account to existing user
            user = await prisma.user.update({
              where: { id: emailExists.id },
              data: {
                githubId: profile.id,
                isVerified: true, // Auto-verify OAuth users
              },
            });
            return done(null, user);
          }

          // Create new user
          const username = profile.username.toLowerCase() + Math.floor(Math.random() * 1000);
          
          user = await prisma.user.create({
            data: {
              githubId: profile.id,
              email: email.toLowerCase(),
              username,
              firstName: profile.displayName?.split(' ')[0],
              lastName: profile.displayName?.split(' ').slice(1).join(' '),
              avatar: profile.photos[0]?.value,
              provider: 'github',
              isVerified: true, // Auto-verify OAuth users
            },
          });

          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
}

module.exports = passport;
