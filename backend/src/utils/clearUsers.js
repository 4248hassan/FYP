const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User');

dotenv.config();

const clearUsers = async () => {
  try {
    await connectDB();
    const result = await User.deleteMany({});
    console.log(`Deleted ${result.deletedCount} users`);
    process.exit(0);
  } catch (error) {
    console.error('Error clearing users:', error);
    process.exit(1);
  }
};

clearUsers();