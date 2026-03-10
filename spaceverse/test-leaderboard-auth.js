const http = require('http');

// First, let's login to get a session
const loginOptions = {
  hostname: 'localhost',
  port: 5002,
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
    
    if (cookies && cookies.length > 0) {
      // Now test the leaderboard with the session cookie
      const leaderboardOptions = {
        hostname: 'localhost',
        port: 5002,
        path: '/api/simulator/leaderboard',
        method: 'GET',
        headers: {
          'Cookie': cookies[0]
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
        console.error('Leaderboard request error:', error.message);
      });

      leaderboardReq.end();
    } else {
      console.log('No cookies received, cannot authenticate');
    }
  });
});

loginReq.on('error', (error) => {
  console.error('Login request error:', error.message);
});

loginReq.write(loginData);
loginReq.end();