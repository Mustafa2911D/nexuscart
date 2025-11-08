const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }
    
    console.log('Connection string:', process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));
    
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📁 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    
    if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
      console.error('🔐 Authentication failed - check username and password in MONGODB_URI');
    } else if (error.message.includes('getaddrinfo')) {
      console.error('🌐 Network error - check cluster URL in MONGODB_URI');
    } else if (error.message.includes('querySrv')) {
      console.error('🔗 DNS error - check MongoDB connection string format');
    }
    
    console.error('Please check your MONGODB_URI in environment variables');
    process.exit(1);
  }
};

module.exports = connectDB;