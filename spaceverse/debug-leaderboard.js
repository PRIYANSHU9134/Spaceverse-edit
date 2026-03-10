const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/spaceverse';

async function debugLeaderboard() {
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
    
    console.log('\n--- Debugging Leaderboard Steps ---');
    
    // Step 1: Test the aggregation query
    console.log('Step 1: Testing aggregation query...');
    try {
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
      
      console.log('Aggregation successful. Result length:', leaderboard.length);
      console.log('First entry:', JSON.stringify(leaderboard[0], null, 2));
      
      // Step 2: Test user lookup
      console.log('\nStep 2: Testing user lookup...');
      if (leaderboard.length > 0) {
        const userIds = leaderboard.map(entry => entry.userId);
        console.log('User IDs to lookup:', userIds);
        
        const users = await User.find({ _id: { $in: userIds } }, 'username');
        console.log('Users found:', users.length);
        console.log('First user:', JSON.stringify(users[0], null, 2));
        
        // Step 3: Create user map
        console.log('\nStep 3: Creating user map...');
        const userMap = {};
        users.forEach(user => {
          userMap[user._id.toString()] = user.username;
        });
        console.log('User map:', userMap);
        
        // Step 4: Format leaderboard
        console.log('\nStep 4: Formatting leaderboard...');
        const formattedLeaderboard = leaderboard.map((entry, index) => ({
          rank: index + 1,
          username: userMap[entry.userId.toString()] || 'Unknown User',
          totalScore: entry.totalScore,
          level: entry.level
        }));
        console.log('Formatted leaderboard:', JSON.stringify(formattedLeaderboard, null, 2));
      }
    } catch (aggregationError) {
      console.error('Aggregation error:', aggregationError);
    }
    
    mongoose.connection.close();
    console.log('\nDebug completed successfully');
  } catch (error) {
    console.error('Main error:', error);
    if (mongoose.connection.readyState === 1) {
      mongoose.connection.close();
    }
  }
}

debugLeaderboard();