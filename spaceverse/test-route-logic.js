const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/spaceverse';

async function testRouteLogic() {
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
    
    console.log('\n--- Simulating Route Logic ---');
    
    // Step 1: Get top 10 users by total score (sum of all three scores)
    console.log('Step 1: Running aggregation query...');
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
    
    // Step 2: Populate user information
    console.log('\nStep 2: Populating user information...');
    const userIds = leaderboard.map(entry => entry.userId);
    console.log('User IDs to lookup:', userIds);
    const users = await User.find({ _id: { $in: userIds } }, 'username');
    console.log('Users found:');
    console.log(JSON.stringify(users, null, 2));
    
    // Step 3: Create user map for quick lookup
    console.log('\nStep 3: Creating user map...');
    const userMap = {};
    users.forEach(user => {
      userMap[user._id.toString()] = user.username;
    });
    console.log('User map:', userMap);
    
    // Step 4: Format leaderboard data
    console.log('\nStep 4: Formatting leaderboard data...');
    const formattedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      username: userMap[entry.userId.toString()] || 'Unknown User',
      totalScore: entry.totalScore,
      level: entry.level
    }));
    
    console.log('Formatted leaderboard:');
    console.log(JSON.stringify(formattedLeaderboard, null, 2));
    
    // Step 5: Get current user's rank (simulate with rock user)
    console.log('\nStep 5: Getting current user rank...');
    const rockUser = await User.findOne({ username: 'rock' });
    if (rockUser) {
      console.log('Found rock user:', rockUser._id);
      const currentUserScore = await UserScore.findOne({ userId: rockUser._id });
      console.log('Current user score:', currentUserScore);
      
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
        console.log('Higher scores count:', higherScoresCount);
        
        currentUserRank = higherScoresCount + 1;
        console.log('Current user rank:', currentUserRank);
      }
      
      // Final response
      console.log('\n--- Final Response ---');
      const response = {
        success: true,
        leaderboard: formattedLeaderboard,
        currentUser: {
          rank: currentUserRank,
          username: rockUser.username,
          totalScore: currentUserScore ? 
            currentUserScore.scores.safetyScore +
            currentUserScore.scores.sustainabilityScore +
            currentUserScore.scores.efficiencyScore : 0,
          level: currentUserScore ? currentUserScore.level : 'Safe Launcher'
        }
      };
      
      console.log('Final response:');
      console.log(JSON.stringify(response, null, 2));
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

testRouteLogic();