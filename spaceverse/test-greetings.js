const axios = require('axios');
const tough = require('tough-cookie');
const cookieJar = new tough.CookieJar();

// Create a session-aware client
const client = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true
});

// Add cookie jar to requests
client.interceptors.request.use(config => {
  return new Promise((resolve) => {
    cookieJar.getCookies(config.baseURL, (err, cookies) => {
      if (!err && cookies && cookies.length > 0) {
        config.headers.cookie = cookies.map(cookie => cookie.cookieString()).join('; ');
      }
      resolve(config);
    });
  });
});

// Store cookies from responses
client.interceptors.response.use(response => {
  if (response.headers['set-cookie']) {
    response.headers['set-cookie'].forEach(cookieStr => {
      cookieJar.setCookieSync(cookieStr, response.config.baseURL);
    });
  }
  return response;
});

async function testGreetings() {
  try {
    // Login with existing user
    console.log('Logging in...');
    const loginResponse = await client.post('/api/login', {
      username: 'testuser_ai',
      password: 'testpassword123'
    });
    
    console.log('Login successful');
    
    // Test chatbot with greeting questions
    console.log('\n--- Testing Greeting Responses ---');
    
    const questions = [
      "Hi",
      "Hello",
      "Hey there",
      "Goodbye",
      "Bye",
      "See you later",
      "Thanks",
      "Thank you so much",
      "How are you?",
      "How do you do?"
    ];
    
    for (const question of questions) {
      console.log(`\nQuestion: ${question}`);
      try {
        const chatbotResponse = await client.post('/api/simulator/chatbot', {
          question: question
        });
        
        console.log(`Answer: ${chatbotResponse.data.answer}`);
      } catch (error) {
        console.error(`Error with question "${question}":`, error.message);
      }
    }
    
    console.log('\n✅ Greeting testing completed!');
    
  } catch (error) {
    console.error('Error in test:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testGreetings();