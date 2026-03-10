const axios = require('axios');

async function testChatbot() {
  try {
    const response = await axios.post('http://localhost:5000/api/simulator/chatbot-public', {
      question: 'Explain the formation of stars in simple terms'
    });
    
    console.log('Chatbot Response:', response.data);
  } catch (error) {
    console.error('Error testing chatbot:', error.message);
  }
}

testChatbot();