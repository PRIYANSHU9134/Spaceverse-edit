// Test that simulates the exact same conditions as the leaderboard route
const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/spaceverse';

async function testFullRoute() {
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
    
    console.log('\n--- Simulating Full Route Logic ---');
    
    // Simulate req.session.userId - use an existing user ID
    const existingUser = await User.findOne({});
    if (!existingUser) {
      console.log('No existing users found');
      mongoose.connection.close();
      return;
    }
    
    const sessionUserId = existingUser._id;
    console.log('Using session user ID:', sessionUserId.toString());
    
    // Execute the exact same logic as the route
    console.log('\n1. Executing aggregation query...');
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
    
    console.log('Aggregation completed. Found', leaderboard.length, 'entries');
    
    console.log('\n2. Populating user information...');
    const userIds = leaderboard.map(entry => entry.userId);
    console.log('Looking up user IDs:', userIds.map(id => id.toString()));
    
    const users = await User.find({ _id: { $in: userIds } }, 'username');
    console.log('Found', users.length, 'users');
    
    console.log('\n3. Creating user map...');
    const userMap = {};
    users.forEach(user => {
      userMap[user._id.toString()] = user.username;
    });
    console.log('User map created:', userMap);
    
    console.log('\n4. Formatting leaderboard data...');
    const formattedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      username: userMap[entry.userId.toString()] || 'Unknown User',
      totalScore: entry.totalScore,
      level: entry.level
    }));
    console.log('Formatted leaderboard:', JSON.stringify(formattedLeaderboard, null, 2));
    
    console.log('\n5. Getting current user\'s rank...');
    const currentUserScore = await UserScore.findOne({ userId: sessionUserId });
    console.log('Current user score found:', !!currentUserScore);
    
    let currentUserRank = null;
    
    if (currentUserScore) {
      const currentUserTotal = 
        currentUserScore.scores.safetyScore +
        currentUserScore.scores.sustainabilityScore +
        currentUserScore.scores.efficiencyScore;
      
      console.log('Current user total score:', currentUserTotal);
      
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
      
      currentUserRank = higherScoresCount + 1;
      console.log('Current user rank:', currentUserRank);
    }
    
    console.log('\n6. Preparing response...');
    const response = {
      success: true,
      leaderboard: formattedLeaderboard,
      currentUser: {
        rank: currentUserRank,
        username: existingUser.username,
        totalScore: currentUserScore ? 
          currentUserScore.scores.safetyScore +
          currentUserScore.scores.sustainabilityScore +
          currentUserScore.scores.efficiencyScore : 0,
        level: currentUserScore ? currentUserScore.level : 'Safe Launcher'
      }
    };
    
    console.log('Response prepared successfully');
    console.log('Response:', JSON.stringify(response, null, 2));
    
    mongoose.connection.close();
    console.log('\nFull route simulation completed successfully');
  } catch (error) {
    console.error('Error in full route simulation:', error);
    if (mongoose.connection.readyState === 1) {
      mongoose.connection.close();
    }
  }
}

testFullRoute();