const mongoose = require('mongoose');
const MONGO_URI = require('./global').MONGO_URI;

const db = MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false
    });

    console.log('MongoDB connected');
  } catch (error) {
    console.error(error.message);

    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
