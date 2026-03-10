const axios = require('axios');

async function testChatbot() {
  try {
    const response = await axios.post('http://localhost:5000/api/simulator/chatbot-public', {
      question: 'What is a black hole?'
    });
    
    console.log('Chatbot Response:', response.data);
  } catch (error) {
    console.error('Error testing chatbot:', error.message);
  }
}

testChatbot();