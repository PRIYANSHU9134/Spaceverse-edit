// Test to see if we can list available models
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listAvailableModels() {
  try {
    console.log('Attempting to list available models...');
    
    // Initialize the SDK with your API key
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // This might not work with the current library version, but let's try
    try {
      // Try to list models - this might not be available in all versions
      if (typeof genAI.listModels === 'function') {
        const models = await genAI.listModels();
        console.log('Available models:', models);
      } else {
        console.log('listModels function not available in this version');
      }
    } catch (listError) {
      console.error('Error listing models:', listError.message);
    }
    
    // Try to directly access the API to see what models are available
    console.log('Trying direct API access...');
    
  } catch (error) {
    console.error('General error:', error.message);
  }
}

listAvailableModels();