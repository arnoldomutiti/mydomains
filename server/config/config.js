require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  whoxyApiKey: process.env.WHOXY_API_KEY,
  jwtSecret: process.env.JWT_SECRET || 'supervalidsecrekey123',
  jwtExpiresIn: '24h',
  bcryptSaltRounds: 10,
  corsOptions: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  }
};
