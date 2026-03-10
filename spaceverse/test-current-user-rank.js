const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/spaceverse';

async function testCurrentUserRank() {
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
    
    console.log('\n--- Testing Current User Rank Calculation ---');
    
    // Get a user score to test with
    const testUserScore = await UserScore.findOne({});
    if (!testUserScore) {
      console.log('No user scores found');
      mongoose.connection.close();
      return;
    }
    
    console.log('Test user score found:', testUserScore.userId.toString());
    
    const currentUserTotal = 
      testUserScore.scores.safetyScore +
      testUserScore.scores.sustainabilityScore +
      testUserScore.scores.efficiencyScore;
    
    console.log('Current user total score:', currentUserTotal);
    
    // Test the countDocuments query
    console.log('\nTesting countDocuments with $expr...');
    try {
      const higherScoresCount = await UserScore.countDocuments({
        $expr: {
          $gt: [
            { 
              $add: [
                "$scores.safetyScore",
                "$scores.sustainabilityScore",
                "$scores.efficiencyScore"
              ]
            },
            currentUserTotal
          ]
        }
      });
      
      console.log('Higher scores count:', higherScoresCount);
      console.log('Current user rank:', higherScoresCount + 1);
    } catch (exprError) {
      console.error('Error with $expr query:', exprError);
    }
    
    mongoose.connection.close();
    console.log('\nTest completed successfully');
  } catch (error) {
    console.error('Main error:', error);
    if (mongoose.connection.readyState === 1) {
      mongoose.connection.close();
    }
  }
}

testCurrentUserRank();