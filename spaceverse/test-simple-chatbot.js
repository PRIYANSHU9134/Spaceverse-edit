const axios = require('axios');

async function testChatbot() {
  try {
    // Test chatbot with a simple question
    console.log('Testing chatbot...');
    const chatbotResponse = await axios.post('http://localhost:5000/api/simulator/chatbot-public', {
      question: 'What is a black hole?'
    });
    
    console.log('Chatbot Response:', JSON.stringify(chatbotResponse.data, null, 2));
  } catch (error) {
    console.error('Error in test:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testChatbot();