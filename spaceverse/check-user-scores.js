const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/spaceverse';

async function checkUserScores() {
  try {
    // Connect to MongoDB
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    
    // Define schemas in the same order as app-enhanced.js
    // User Schema for Login System
    const userSchema = new mongoose.Schema({
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        quizScores: [{ 
            score: Number, 
            totalQuestions: Number, 
            completedAt: { type: Date, default: Date.now } 
        }]
    });

    const User = mongoose.model('User', userSchema);
    
    // Initialize space traffic simulator models
    const simulatorRoute = require('./routes/simulator');
    simulatorRoute.initializeModels();
    
    // Now test the models
    const UserScore = mongoose.model('UserScore');
    
    // Find all user scores
    const userScores = await UserScore.find({}).populate('userId', 'username');
    console.log('Existing user scores:');
    console.log(JSON.stringify(userScores, null, 2));
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUserScores();