const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config({ path: path.resolve(process.cwd(), './config/.env') });

const db = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(db, { useNewUrlParser: true });

    console.log('MongoDB connected');
  } catch (error) {
    console.error(error.message);

    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
