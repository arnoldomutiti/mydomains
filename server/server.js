const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./database');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const { SECRET_KEY } = require('./middleware/auth');

// Route modules
const authRoutes = require('./routes/auth');
const domainRoutes = require('./routes/domains');
const externalRoutes = require('./routes/external');
const notificationRoutes = require('./routes/notifications');
const cacheRoutes = require('./routes/cache');

// Cron jobs
const { setupNotificationCron } = require('./cron/notifications');
const { setupCacheCron, initialCacheSetup } = require('./cron/cache');

const app = express();
const PORT = process.env.PORT || 5000;
const WHOXY_API_KEY = process.env.WHOXY_API_KEY;

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Session middleware
app.use(session({
  secret: SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
    done(err, user);
  });
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/api/auth/google/callback"
  },
  (accessToken, refreshToken, profile, done) => {
    const normalizedEmail = profile.emails[0].value.toLowerCase().trim();

    db.get('SELECT * FROM users WHERE email = ?', [normalizedEmail], (err, user) => {
      if (err) return done(err);

      if (user) {
        return done(null, user);
      } else {
        const email = normalizedEmail;
        const name = profile.displayName;

        db.run(
          'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
          [name, email, 'google-oauth'],
          function(err) {
            if (err) return done(err);

            db.get('SELECT * FROM users WHERE id = ?', [this.lastID], (err, newUser) => {
              return done(err, newUser);
            });
          }
        );
      }
    });
  }
));

// Mount routes
app.use('/api', authRoutes);
app.use('/api/domains', domainRoutes);
app.use('/api', externalRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', cacheRoutes);

// Setup cron jobs
setupNotificationCron();
setupCacheCron(WHOXY_API_KEY);

// Initial cache check on server start
(async () => {
    await initialCacheSetup(WHOXY_API_KEY);
})();

app.listen(PORT, () => {
    console.log(`\nServer running on port ${PORT}`);
});
