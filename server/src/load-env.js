// This file ensures environment variables are loaded even when PowerShell has issues
const fs = require('fs');
const path = require('path');

try {
  // Read the .env file
  const envPath = path.resolve(__dirname, '..', '.env');
  
  if (fs.existsSync(envPath)) {
    console.log('Found .env file at:', envPath);
    const envConfig = fs.readFileSync(envPath, 'utf8').split('\n');
    
    // Apply each line as an environment variable
    envConfig.forEach(line => {
      const keyValueArr = line.split('=');
      if (keyValueArr.length === 2) {
        const key = keyValueArr[0].trim();
        const value = keyValueArr[1].trim();
        process.env[key] = value;
      }
    });
  } else {
    console.log('.env file not found, setting default environment variables');
    // Set default environment variables
    process.env.PORT = process.env.PORT || '5001';
    process.env.NODE_ENV = process.env.NODE_ENV || 'development';
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'workout_tracker_super_secure_jwt_token_2023';
    process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/workout-tracker';
  }
} catch (error) {
  console.error('Error loading .env file:', error.message);
  // Set default environment variables as a fallback
  process.env.PORT = process.env.PORT || '5001';
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'workout_tracker_super_secure_jwt_token_2023';
  process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/workout-tracker';
}

console.log('Environment variables configured:');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set ✓' : 'Not set ✗');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set ✓' : 'Not set ✗'); 