const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: JWT_SECRET environment variable is missing in production environment!');
    }
    return 'careermatch_dev_secret_key_2026';
  }
  return process.env.JWT_SECRET;
};

const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, getJwtSecret(), {
    expiresIn: '30d',
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, getJwtSecret());
};

module.exports = { generateToken, verifyToken, getJwtSecret };
