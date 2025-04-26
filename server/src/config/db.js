const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use hardcoded fallback if environment variable is not set
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/workout-tracker';
    
    console.log('Connecting to MongoDB using URI:', mongoURI);
    
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB; 