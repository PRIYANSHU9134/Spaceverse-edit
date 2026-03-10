const http = require('http');

// First, let's register a test user
const registerOptions = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const registerData = JSON.stringify({
  username: 'leaderboardtest',
  email: 'leaderboard@test.com',
  password: 'testpassword123'
});

const registerReq = http.request(registerOptions, (res) => {
  let registerResponse = '';
  
  res.on('data', (chunk) => {
    registerResponse += chunk;
  });
  
  res.on('end', () => {
    console.log('Register response:', registerResponse);
    
    // Now login to get session
    const loginOptions = {
      hostname: 'localhost',
      port: 5001,
      path: '/api/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const loginData = JSON.stringify({
      username: 'leaderboardtest',
      password: 'testpassword123'
    });

    const loginReq = http.request(loginOptions, (res) => {
      let loginResponse = '';
      const cookies = res.headers['set-cookie'];
      
      res.on('data', (chunk) => {
        loginResponse += chunk;
      });
      
      res.on('end', () => {
        console.log('Login response:', loginResponse);
        console.log('Cookies:', cookies);
        
        // Now test the leaderboard endpoint with authentication
        const leaderboardOptions = {
          hostname: 'localhost',
          port: 5001,
          path: '/api/simulator/leaderboard',
          method: 'GET',
          headers: {
            'Cookie': cookies ? cookies[0] : ''
          }
        };

        const leaderboardReq = http.request(leaderboardOptions, (res) => {
          let leaderboardResponse = '';
          
          res.on('data', (chunk) => {
            leaderboardResponse += chunk;
          });
          
          res.on('end', () => {
            console.log('Leaderboard Status Code:', res.statusCode);
            console.log('Leaderboard Response:', leaderboardResponse);
          });
        });

        leaderboardReq.on('error', (error) => {
          console.error('Leaderboard Error:', error.message);
        });

        leaderboardReq.end();
      });
    });

    loginReq.on('error', (error) => {
      console.error('Login Error:', error.message);
    });

    loginReq.write(loginData);
    loginReq.end();
  });
});

registerReq.on('error', (error) => {
  console.error('Register Error:', error.message);
});

registerReq.write(registerData);
registerReq.end();