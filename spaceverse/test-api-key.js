// Simple test to check if the Gemini API key is working
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testApiKey() {
  try {
    console.log('Testing Gemini API key...');
    
    // Check if API key is set
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set in .env file');
      return;
    }
    
    console.log('API Key is set');
    
    // Initialize the SDK with your API key
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Try to get model info using the most basic approach
    try {
      // Just try to create a model object and see if it throws an error
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      console.log('Model object created successfully');
      
      // Try to list some basic info about the model
      console.log('Model config:', model.config);
    } catch (modelError) {
      console.error('Error creating model object:', modelError.message);
    }
    
  } catch (error) {
    console.error('General error:', error.message);
  }
}

testApiKey();