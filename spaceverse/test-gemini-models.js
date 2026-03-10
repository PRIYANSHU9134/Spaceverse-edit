// Test script to check available Gemini models
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testModels() {
  try {
    console.log('Testing Gemini API models...');
    
    // Initialize the SDK with your API key
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Try to get model info directly
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      console.log('Model object created successfully');
      
      // Try a simple generate content call
      const result = await model.generateContent("Hello, what model are you?");
      const response = await result.response;
      const text = response.text();
      console.log('Response from gemini-pro:', text);
    } catch (error) {
      console.error('Error with gemini-pro:', error.message);
    }
    
    // Try another model
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
      console.log('Model object created successfully');
      
      // Try a simple generate content call
      const result = await model.generateContent("Hello, what model are you?");
      const response = await result.response;
      const text = response.text();
      console.log('Response from gemini-1.5-pro-latest:', text);
    } catch (error) {
      console.error('Error with gemini-1.5-pro-latest:', error.message);
    }
    
  } catch (error) {
    console.error('General error:', error);
  }
}

testModels();