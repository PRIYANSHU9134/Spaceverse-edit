const axios = require('axios');

async function testRealTimePrediction() {
  try {
    // First, we need to login to get a session
    // For simplicity, we'll test the endpoint directly
    
    const testData = {
      parameters: {
        altitude: 500,
        inclination: 45,
        velocity: 7.8,
        mass: 1000
      },
      currentState: {
        objectsInLEO: 3000,
        objectsInMEO: 500,
        objectsInGEO: 2000,
        averageCongestion: 0.5,
        collisionProbability: 0.01
      },
      environmentalFactors: {
        geomagnetic_storm_severity: 3,
        solar_radiation_level: 5,
        near_earth_objects: 2
      },
      timeHorizon: 24
    };
    
    console.log('Testing real-time prediction endpoint...');
    const response = await axios.post('http://localhost:5000/api/simulator/real-time-prediction', testData);
    
    console.log('Real-time Prediction Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error testing real-time prediction:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testRealTimePrediction();