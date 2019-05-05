const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), './config/.env') });

module.exports = {
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET
};
