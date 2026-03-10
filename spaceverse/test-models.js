// Test script that follows the same pattern as app-enhanced.js
const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/spaceverse';

async function testModels() {
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
    
    // Test the aggregation query
    console.log('\n--- Testing Aggregation Query ---');
    const leaderboard = await UserScore.aggregate([
      {
        $project: {
          userId: 1,
          scores: 1,
          level: 1,
          totalScore: {
            $add: [
              "$scores.safetyScore",
              "$scores.sustainabilityScore",
              "$scores.efficiencyScore"
            ]
          }
        }
      },
      {
        $sort: { totalScore: -1 }
      },
      {
        $limit: 10
      }
    ]);
    
    console.log('Aggregation result:');
    console.log(JSON.stringify(leaderboard, null, 2));
    
    // Test getting user information
    if (leaderboard.length > 0) {
      console.log('\n--- Testing User Lookup ---');
      const userIds = leaderboard.map(entry => entry.userId);
      const users = await User.find({ _id: { $in: userIds } }, 'username');
      console.log('Users found:');
      console.log(JSON.stringify(users, null, 2));
    }
    
    mongoose.connection.close();
    console.log('\nTest completed successfully');
  } catch (error) {
    console.error('Error:', error);
    if (mongoose.connection.readyState === 1) {
      mongoose.connection.close();
    }
  }
}

testModels();