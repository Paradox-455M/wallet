const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Local Strategy (Email/Password)
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const user = await User.findByEmail(email);
      if (!user) {
        return done(null, false, { message: 'Incorrect email.' });
      }
      if (!user.password_hash) { // User might have signed up with OAuth
        return done(null, false, { message: 'Please log in with your social account or reset your password.' });
      }
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
    scope: ['profile', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await User.findOrCreateSocialUser(profile, 'google');
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// GitHub OAuth Strategy
// passport.use(new GitHubStrategy({
//     clientID: process.env.GITHUB_CLIENT_ID,
//     clientSecret: process.env.GITHUB_CLIENT_SECRET,
//     callbackURL: process.env.GITHUB_CALLBACK_URL || '/api/auth/github/callback',
//     scope: ['user:email'] // Request user's primary email
//   },
//   async (accessToken, refreshToken, profile, done) => {
//     try {
//       // GitHub might not always provide a public email, adjust logic as needed
//       if (profile.emails && profile.emails.length > 0) {
//         profile.email = profile.emails.find(e => e.primary)?.value || profile.emails[0].value;
//       } else {
//         // Attempt to fetch primary email if not in initial profile (requires 'user:email' scope)
//         // This part might need a separate API call to GitHub if email is not directly available
//         // For simplicity, we'll proceed if email is null, User model handles this.
//       }
//       const user = await User.findOrCreateSocialUser(profile, 'github');
//       return done(null, user);
//     } catch (err) {
//       return done(err);
//     }
//   }
// ));

// Serialize user into the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');


// JWT Strategy for protecting routes
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'your_jwt_secret_key_must_be_strong_and_in_env',
};

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await User.findById(payload.id);
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch (error) {
    return done(error, false);
  }
}));

module.exports = passport;