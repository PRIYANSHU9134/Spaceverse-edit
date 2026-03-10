const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/spaceverse';

async function testLeaderboard() {
  try {
    // Connect to MongoDB
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    
    // Import the models after connection
    const User = mongoose.model('User');
    const UserScore = mongoose.model('UserScore');
    
    // Check if we have any users
    const userCount = await User.countDocuments();
    console.log(`Found ${userCount} users in the database`);
    
    if (userCount === 0) {
      console.log('No users found. Creating a test user...');
      // Create a test user
      const newUser = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'testpassword'
      });
      await newUser.save();
      console.log('Created test user');
      
      // Create a user score for the test user
      const newUserScore = new UserScore({
        userId: newUser._id,
        scores: {
          safetyScore: 85,
          sustainabilityScore: 78,
          efficiencyScore: 92
        },
        level: 'Orbital Optimizer',
        badges: [
          { id: 'first_simulation', name: 'First Simulation', earnedAt: new Date() }
        ],
        achievements: [],
        totalSimulations: 5,
        lastUpdated: new Date()
      });
      await newUserScore.save();
      console.log('Created test user score');
    }
    
    // Test the aggregation query directly
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

testLeaderboard();