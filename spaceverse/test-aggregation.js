const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/spaceverse';

async function testAggregation() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    
    // Get the UserScore model
    const UserScore = mongoose.model('UserScore');
    
    // Test the aggregation query
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
    
    console.log('Leaderboard aggregation result:');
    console.log(JSON.stringify(leaderboard, null, 2));
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

testAggregation();