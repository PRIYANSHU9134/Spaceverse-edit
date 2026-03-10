# Backend Service Flow for Space Traffic Simulator

## Overview

This document describes the backend service flow for the What-If Space Traffic Simulator, detailing how requests are processed through the system components.

## Service Flow Diagram

```
User Request
     │
     ▼
┌─────────────────┐
│   API Gateway   │
│ (Express.js)    │
└─────────────────┘
     │
     ▼
┌─────────────────┐
│ Auth Middleware │
└─────────────────┘
     │
     ▼
┌─────────────────┐    ┌────────────────────┐
│  Validation &   │────▶  Error Handling   │
│   Sanitization  │    │   (If Invalid)     │
└─────────────────┘    └────────────────────┘
     │                         │
     ▼                         ▼
┌─────────────────┐    ┌────────────────────┐
│   Simulation    │    │  Return Error      │
│    Engine       │    │   Response         │
│ (Node.js)       │    │                    │
└─────────────────┘    └────────────────────┘
     │
     ▼
┌─────────────────┐
│   Save to DB    │
│ (MongoDB)       │
└─────────────────┘
     │
     ▼
┌─────────────────┐
│  Call AI Service│
│ (Python/Flask)  │
└─────────────────┘
     │
     ▼
┌─────────────────┐
│ Process AI Resp │
└─────────────────┘
     │
     ▼
┌─────────────────┐
│ Update Gamific. │
│    Scores       │
└─────────────────┘
     │
     ▼
┌─────────────────┐
│ Return Combined │
│   Response      │
└─────────────────┘
```

## Detailed Flow Description

### 1. Request Entry Point

All requests enter through the Express.js API gateway at `/api/simulation/*` endpoints.

#### Middleware Chain:
1. **CORS Middleware**: Enables cross-origin requests
2. **Body Parser**: Parses JSON request bodies
3. **Rate Limiting**: Prevents abuse (e.g., 100 requests/hour per user)
4. **Authentication**: Verifies user session
5. **Input Validation**: Validates request parameters

### 2. Scenario Submission Flow

When a user submits a new scenario:

```
POST /api/simulation/run
{
  "eventType": "launch",
  "parameters": {
    "altitude": 500,
    "inclination": 45,
    "velocity": 7.8,
    "mass": 1000,
    "launchTime": "2025-12-20T10:00:00Z"
  },
  "scenarioName": "Test Satellite Launch"
}
```

#### Step 1: Input Validation
- Validate event type is one of: launch, adjustment, breakup
- Validate numerical parameters within acceptable ranges
- Validate date format
- Sanitize all inputs to prevent injection attacks

#### Step 2: Simulation Engine Processing
The simulation engine performs these calculations:

1. **Orbit Classification**:
   - LEO: < 2000 km altitude
   - MEO: 2000-35786 km altitude
   - GEO: ≈ 35786 km altitude

2. **Density Calculation**:
   - Query existing objects in the orbital band
   - Calculate object density per cubic kilometer

3. **Collision Probability**:
   - Based on relative velocities
   - Proximity to other objects
   - Object sizes and masses

4. **Before/After Comparison**:
   - Generate state before scenario
   - Generate state after scenario
   - Calculate differences

#### Step 3: Database Persistence
Store the simulation in MongoDB:

```javascript
// simulations collection
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),
  scenarioName: "Test Satellite Launch",
  eventType: "launch",
  parameters: {
    altitude: 500,
    inclination: 45,
    velocity: 7.8,
    mass: 1000,
    launchTime: ISODate("2025-12-20T10:00:00Z")
  },
  results: {
    beforeState: {
      objectsInLEO: 2500,
      averageCongestion: 0.35,
      collisionProbability: 0.002
    },
    afterState: {
      objectsInLEO: 2501,
      averageCongestion: 0.36,
      collisionProbability: 0.0025
    }
  },
  createdAt: ISODate("2025-12-20T10:00:00Z"),
  updatedAt: ISODate("2025-12-20T10:00:00Z")
}
```

Also update scenario history:

```javascript
// scenario_history collection
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),
  simulationId: ObjectId("..."),
  eventType: "launch",
  scenarioName: "Test Satellite Launch",
  createdAt: ISODate("2025-12-20T10:00:00Z"),
  riskLevel: "medium"
}
```

#### Step 4: AI Service Invocation
Call the Python microservice:

```http
POST http://localhost:8000/ai/simulate-impact
Content-Type: application/json

{
  "simulationId": "sim_1234567890",
  "beforeState": {
    "objectsInLEO": 2500,
    "averageCongestion": 0.35,
    "collisionProbability": 0.002
  },
  "afterState": {
    "objectsInLEO": 2501,
    "averageCongestion": 0.36,
    "collisionProbability": 0.0025
  }
}
```

#### Step 5: AI Response Processing
Receive and process the AI analysis:

```javascript
{
  "predictionId": "pred_1234567890",
  "collisionRiskPercentage": 85.5,
  "orbitalCongestionIncrease": 72.3,
  "secondaryDebrisProbability": 12.8,
  "confidenceLevel": 92.1,
  "explanation": "Adding this satellite increases collision risk by 25%...",
  "recommendations": [
    "Consider adjusting inclination by 5 degrees...",
    "Launch during a different orbital slot..."
  ]
}
```

#### Step 6: Gamification Score Updates
Calculate and update user scores:

1. **Safety Score**: Based on collision risk avoidance
2. **Sustainability Score**: Based on congestion impact
3. **Efficiency Score**: Based on optimal parameter choices

Update database:

```javascript
// user_scores collection
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),
  scores: {
    safetyScore: 85,
    sustainabilityScore: 78,
    efficiencyScore: 92
  },
  level: "Orbital Optimizer",
  badges: ["first_simulation", "low_risk_expert"],
  lastUpdated: ISODate("2025-12-20T10:05:00Z")
}
```

#### Step 7: Response Assembly
Combine all data for the final response:

```json
{
  "success": true,
  "simulationId": "sim_1234567890",
  "scenarioName": "Test Satellite Launch",
  "results": {
    "beforeState": {
      "objectsInLEO": 2500,
      "averageCongestion": 0.35,
      "collisionProbability": 0.002
    },
    "afterState": {
      "objectsInLEO": 2501,
      "averageCongestion": 0.36,
      "collisionProbability": 0.0025
    }
  },
  "aiAnalysis": {
    "collisionRiskPercentage": 85.5,
    "orbitalCongestionIncrease": 72.3,
    "secondaryDebrisProbability": 12.8,
    "confidenceLevel": 92.1,
    "explanation": "Adding this satellite increases collision risk by 25%...",
    "recommendations": [
      "Consider adjusting inclination by 5 degrees...",
      "Launch during a different orbital slot..."
    ]
  },
  "gamification": {
    "scoreChanges": {
      "safetyScore": 5,
      "sustainabilityScore": 3,
      "efficiencyScore": 7
    },
    "newLevel": "Orbital Optimizer",
    "newBadges": ["low_collision_risk"]
  }
}
```

### 3. Error Handling Flow

If any step fails, the system follows this error handling flow:

1. **Validation Errors**: Return 400 Bad Request with specific error messages
2. **Authentication Errors**: Return 401 Unauthorized
3. **Simulation Engine Errors**: Return 500 Internal Server Error with logging
4. **AI Service Errors**: Return partial results with error indication
5. **Database Errors**: Retry mechanism with exponential backoff
6. **Network Errors**: Timeout handling with fallback responses

### 4. Asynchronous Processing

For long-running simulations:
1. Accept the request and return 202 Accepted
2. Queue the simulation for background processing
3. Provide endpoint to check simulation status
4. Notify user via WebSocket or polling when complete

### 5. Caching Strategy

Implement caching for:
1. **Frequently accessed scenarios**: Cache for 1 hour
2. **User scores**: Cache for 5 minutes
3. **Leaderboard**: Cache for 10 minutes
4. **AI predictions**: Cache for 24 hours (for identical scenarios)

Cache keys follow the pattern: `simulation:{id}`, `user:{id}:scores`, `leaderboard`, `ai:{hash}`

### 6. Monitoring and Logging

All service flows include:
1. **Request logging**: Log all incoming requests with timestamps
2. **Performance metrics**: Track response times and throughput
3. **Error tracking**: Log all errors with stack traces
4. **Audit trails**: Track all data modifications
5. **Health checks**: Monitor service availability

### 7. Security Measures

1. **Input sanitization**: Prevent injection attacks
2. **Rate limiting**: Protect against abuse
3. **Authentication**: Verify user identity
4. **Authorization**: Ensure users can only access their own data
5. **Data encryption**: Encrypt sensitive data at rest
6. **Secure communication**: Use HTTPS for all external communications
7. **API key protection**: Store keys in environment variables