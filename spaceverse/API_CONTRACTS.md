# API Contracts for Space Traffic Simulator

## Overview

This document defines the API contracts for all services in the What-If Space Traffic Simulator, including request/response formats, endpoints, and authentication requirements.

## Table of Contents

1. [Simulation Engine API](#simulation-engine-api)
2. [AI Prediction Service API](#ai-prediction-service-api)
3. [Gamification API](#gamification-api)
4. [Scenario History API](#scenario-history-api)

## Simulation Engine API

Base URL: `/api/simulation`

### POST /api/simulation/run

Runs a space traffic simulation with the provided parameters.

#### Request

```json
{
  "eventType": "launch", // "launch" | "adjustment" | "breakup"
  "parameters": {
    "altitude": 500, // km
    "inclination": 45, // degrees
    "velocity": 7.8, // km/s
    "mass": 1000, // kg
    "launchTime": "2025-12-20T10:00:00Z" // ISO 8601 format
  },
  "scenarioName": "Test Satellite Launch"
}
```

#### Response (Success)

```json
{
  "success": true,
  "simulationId": "sim_1234567890",
  "timestamp": "2025-12-20T10:00:00Z",
  "beforeState": {
    "objectsInLEO": 2500,
    "averageCongestion": 0.35,
    "collisionProbability": 0.002
  },
  "afterState": {
    "objectsInLEO": 2501,
    "averageCongestion": 0.36,
    "collisionProbability": 0.0025
  },
  "changes": {
    "newObjects": 1,
    "congestionChange": 0.01,
    "riskChange": 0.0005
  }
}
```

#### Response (Error)

```json
{
  "success": false,
  "error": "Invalid altitude value. Must be between 100 and 5000 km."
}
```

### GET /api/simulation/{simulationId}

Retrieves a previously run simulation by ID.

#### Response

```json
{
  "simulationId": "sim_1234567890",
  "userId": "user_0987654321",
  "scenarioName": "Test Satellite Launch",
  "eventType": "launch",
  "parameters": {
    "altitude": 500,
    "inclination": 45,
    "velocity": 7.8,
    "mass": 1000,
    "launchTime": "2025-12-20T10:00:00Z"
  },
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
    },
    "changes": {
      "newObjects": 1,
      "congestionChange": 0.01,
      "riskChange": 0.0005
    }
  },
  "createdAt": "2025-12-20T10:00:00Z"
}
```

## AI Prediction Service API

Base URL: `http://localhost:8000` (separate Python microservice)

### POST /ai/simulate-impact

Analyzes simulation results and predicts impacts.

#### Request

```json
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
  },
  "changes": {
    "newObjects": 1,
    "congestionChange": 0.01,
    "riskChange": 0.0005
  }
}
```

#### Response

```json
{
  "predictionId": "pred_1234567890",
  "collisionRiskPercentage": 85.5,
  "orbitalCongestionIncrease": 72.3,
  "secondaryDebrisProbability": 12.8,
  "confidenceLevel": 92.1,
  "explanation": "Adding this satellite increases collision risk by 25% due to proximity to existing satellites in similar orbits.",
  "recommendations": [
    "Consider adjusting inclination by 5 degrees to reduce overlap",
    "Launch during a different orbital slot to minimize congestion"
  ]
}
```

### POST /ai/predict-risk

Provides a detailed risk assessment for a specific scenario.

#### Request

```json
{
  "eventType": "launch",
  "parameters": {
    "altitude": 500,
    "inclination": 45,
    "velocity": 7.8,
    "mass": 1000,
    "launchTime": "2025-12-20T10:00:00Z"
  }
}
```

#### Response

```json
{
  "riskAssessmentId": "risk_1234567890",
  "collisionRiskScore": 7.2, // Scale of 1-10
  "congestionRiskScore": 6.8, // Scale of 1-10
  "longTermImpactScore": 5.5, // Scale of 1-10
  "riskFactors": [
    {
      "factor": "High traffic density at this altitude",
      "severity": "high",
      "description": "500km altitude has 15% more objects than average"
    },
    {
      "factor": "Common inclination",
      "severity": "medium",
      "description": "45-degree inclination overlaps with 200+ existing satellites"
    }
  ],
  "mitigationStrategies": [
    "Increase altitude by 50km to reduce object density",
    "Adjust inclination by 10 degrees to avoid peak congestion zones"
  ]
}
```

## Gamification API

Base URL: `/api/gamification`

### GET /api/gamification/scores

Retrieves the current user's gamification scores.

#### Response

```json
{
  "userId": "user_0987654321",
  "scores": {
    "safetyScore": 85,
    "sustainabilityScore": 78,
    "efficiencyScore": 92
  },
  "level": "Orbital Optimizer",
  "badges": [
    {
      "id": "first_simulation",
      "name": "First Simulation",
      "earnedAt": "2025-12-20T10:00:00Z"
    },
    {
      "id": "low_risk_expert",
      "name": "Low Risk Expert",
      "earnedAt": "2025-12-19T15:30:00Z"
    }
  ],
  "achievements": [
    {
      "id": "ten_simulations",
      "name": "Simulation Specialist",
      "description": "Run 10 simulations",
      "progress": 3,
      "target": 10
    }
  ]
}
```

### POST /api/gamification/update-scores

Updates user scores based on simulation results.

#### Request

```json
{
  "simulationId": "sim_1234567890",
  "scoreChanges": {
    "safetyScore": 5,
    "sustainabilityScore": 3,
    "efficiencyScore": 7
  },
  "newBadges": ["low_collision_risk"]
}
```

#### Response

```json
{
  "success": true,
  "updatedScores": {
    "safetyScore": 90,
    "sustainabilityScore": 81,
    "efficiencyScore": 99
  },
  "level": "Space Sustainability Engineer",
  "newBadges": [
    {
      "id": "low_collision_risk",
      "name": "Low Collision Risk",
      "earnedAt": "2025-12-20T10:05:00Z"
    }
  ]
}
```

### GET /api/gamification/leaderboard

Retrieves the top users on the leaderboard.

#### Response

```json
{
  "leaderboard": [
    {
      "rank": 1,
      "username": "space_navigator",
      "totalScore": 285,
      "level": "Space Sustainability Engineer"
    },
    {
      "rank": 2,
      "username": "orbital_master",
      "totalScore": 267,
      "level": "Orbital Optimizer"
    },
    {
      "rank": 3,
      "username": "debris_defender",
      "totalScore": 245,
      "level": "Safe Launcher"
    }
  ],
  "currentUser": {
    "rank": 12,
    "username": "new_astronaut",
    "totalScore": 120,
    "level": "Orbital Optimizer"
  }
}
```

## Scenario History API

Base URL: `/api/scenarios`

### GET /api/scenarios/history

Retrieves the user's scenario history.

#### Response

```json
{
  "scenarios": [
    {
      "simulationId": "sim_1234567890",
      "scenarioName": "Test Satellite Launch",
      "eventType": "launch",
      "createdAt": "2025-12-20T10:00:00Z",
      "riskLevel": "medium", // "low" | "medium" | "high"
      "congestionImpact": "low"
    },
    {
      "simulationId": "sim_0987654321",
      "scenarioName": "Debris Breakup Event",
      "eventType": "breakup",
      "createdAt": "2025-12-19T14:30:00Z",
      "riskLevel": "high",
      "congestionImpact": "high"
    }
  ]
}
```

### GET /api/scenarios/{simulationId}

Retrieves details for a specific scenario.

#### Response

```json
{
  "simulationId": "sim_1234567890",
  "scenarioName": "Test Satellite Launch",
  "eventType": "launch",
  "parameters": {
    "altitude": 500,
    "inclination": 45,
    "velocity": 7.8,
    "mass": 1000,
    "launchTime": "2025-12-20T10:00:00Z"
  },
  "resultsSummary": {
    "objectsInLEO": {
      "before": 2500,
      "after": 2501
    },
    "averageCongestion": {
      "before": 0.35,
      "after": 0.36
    },
    "collisionProbability": {
      "before": 0.002,
      "after": 0.0025
    }
  },
  "aiAnalysis": {
    "collisionRiskPercentage": 85.5,
    "orbitalCongestionIncrease": 72.3,
    "secondaryDebrisProbability": 12.8
  },
  "createdAt": "2025-12-20T10:00:00Z"
}
```