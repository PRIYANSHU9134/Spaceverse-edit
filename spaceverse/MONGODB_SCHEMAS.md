# MongoDB Schemas for Space Traffic Simulator

## Overview

This document defines the MongoDB schemas for the new collections required by the What-If Space Traffic Simulator, extending the existing SpaceVerse application.

## Existing Collections (Reference)

### Users Collection
Already exists in SpaceVerse application:
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String, // Hashed
  createdAt: Date,
  quizScores: [{
    score: Number,
    totalQuestions: Number,
    completedAt: Date
  }]
}
```

## New Collections

### 1. Simulations Collection

Stores all simulation scenarios and their results.

```javascript
// Collection: simulations
{
  _id: ObjectId,
  userId: ObjectId, // Reference to users collection
  scenarioName: String, // User-defined name for the scenario
  eventType: String, // "launch" | "adjustment" | "breakup"
  parameters: {
    altitude: Number, // km
    inclination: Number, // degrees
    velocity: Number, // km/s
    mass: Number, // kg
    launchTime: Date // ISO date string
  },
  results: {
    beforeState: {
      objectsInLEO: Number, // Objects in Low Earth Orbit
      objectsInMEO: Number, // Objects in Medium Earth Orbit
      objectsInGEO: Number, // Objects in Geostationary Orbit
      averageCongestion: Number, // 0-1 scale
      collisionProbability: Number // 0-1 scale
    },
    afterState: {
      objectsInLEO: Number,
      objectsInMEO: Number,
      objectsInGEO: Number,
      averageCongestion: Number, // 0-1 scale
      collisionProbability: Number // 0-1 scale
    },
    changes: {
      newObjects: Number,
      congestionChange: Number, // Absolute change
      riskChange: Number // Absolute change
    }
  },
  aiAnalysis: {
    predictionId: String, // Reference to AI service prediction
    collisionRiskPercentage: Number, // 0-100
    orbitalCongestionIncrease: Number, // Percentage increase
    secondaryDebrisProbability: Number, // 0-100
    confidenceLevel: Number, // 0-100
    explanation: String, // Natural language explanation
    recommendations: [String] // Actionable recommendations
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 2. User Scores Collection

Tracks gamification scores and achievements for each user.

```javascript
// Collection: user_scores
{
  _id: ObjectId,
  userId: ObjectId, // Reference to users collection
  scores: {
    safetyScore: Number, // 0-100
    sustainabilityScore: Number, // 0-100
    efficiencyScore: Number // 0-100
  },
  level: String, // "Safe Launcher" | "Orbital Optimizer" | "Space Sustainability Engineer"
  badges: [{
    id: String, // Unique badge identifier
    name: String, // Human-readable badge name
    earnedAt: Date // When the badge was earned
  }],
  achievements: [{
    id: String, // Unique achievement identifier
    name: String, // Human-readable achievement name
    description: String, // Description of how to earn it
    progress: Number, // Current progress toward target
    target: Number, // Target value to achieve
    earnedAt: Date // When the achievement was earned (null if not yet earned)
  }],
  totalSimulations: Number, // Total number of simulations run
  lastUpdated: Date
}
```

### 3. Scenario History Collection

Maintains a history of all scenarios for quick access and analytics.

```javascript
// Collection: scenario_history
{
  _id: ObjectId,
  userId: ObjectId, // Reference to users collection
  simulationId: ObjectId, // Reference to simulations collection
  scenarioName: String, // User-defined name for the scenario
  eventType: String, // "launch" | "adjustment" | "breakup"
  parametersSnapshot: {
    // Snapshot of the parameters at time of creation
    altitude: Number, // km
    inclination: Number, // degrees
    velocity: Number, // km/s
    mass: Number, // kg
    launchTime: Date // ISO date string
  },
  createdAt: Date,
  riskLevel: String, // "low" | "medium" | "high" (based on AI analysis)
  congestionImpact: String // "low" | "medium" | "high"
}
```

## Indexes

### Simulations Collection Indexes
```javascript
// Index on userId for fast user-specific queries
db.simulations.createIndex({ "userId": 1 })

// Compound index for sorting by creation date
db.simulations.createIndex({ "userId": 1, "createdAt": -1 })

// Index on simulationId for fast lookups
db.simulations.createIndex({ "simulationId": 1 }, { unique: true })
```

### User Scores Collection Indexes
```javascript
// Unique index on userId
db.user_scores.createIndex({ "userId": 1 }, { unique: true })

// Index for leaderboard queries (sorted by total score)
db.user_scores.createIndex({ "scores.safetyScore": -1, "scores.sustainabilityScore": -1, "scores.efficiencyScore": -1 })
```

### Scenario History Collection Indexes
```javascript
// Index on userId for fast user-specific queries
db.scenario_history.createIndex({ "userId": 1 })

// Compound index for sorting by creation date
db.scenario_history.createIndex({ "userId": 1, "createdAt": -1 })

// Index on risk level for filtering
db.scenario_history.createIndex({ "riskLevel": 1 })

// Index on event type for filtering
db.scenario_history.createIndex({ "eventType": 1 })
```

## Sample Documents

### Sample Simulation Document
```javascript
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "userId": ObjectId("507f191e810c19729de860ea"),
  "scenarioName": "Starlink Satellite Launch",
  "eventType": "launch",
  "parameters": {
    "altitude": 550,
    "inclination": 53,
    "velocity": 7.7,
    "mass": 260,
    "launchTime": ISODate("2025-12-20T14:30:00Z")
  },
  "results": {
    "beforeState": {
      "objectsInLEO": 3240,
      "objectsInMEO": 450,
      "objectsInGEO": 2100,
      "averageCongestion": 0.42,
      "collisionProbability": 0.0031
    },
    "afterState": {
      "objectsInLEO": 3241,
      "objectsInMEO": 450,
      "objectsInGEO": 2100,
      "averageCongestion": 0.42,
      "collisionProbability": 0.0032
    },
    "changes": {
      "newObjects": 1,
      "congestionChange": 0.00,
      "riskChange": 0.0001
    }
  },
  "aiAnalysis": {
    "predictionId": "pred_9876543210",
    "collisionRiskPercentage": 78.5,
    "orbitalCongestionIncrease": 0.2,
    "secondaryDebrisProbability": 5.3,
    "confidenceLevel": 88.7,
    "explanation": "Adding this satellite at 550km altitude with 53° inclination introduces moderate collision risk due to proximity to existing Starlink satellites in similar orbits.",
    "recommendations": [
      "Consider increasing altitude by 20km to reduce object density",
      "Adjust inclination by 3° to minimize overlap with existing constellation"
    ]
  },
  "createdAt": ISODate("2025-12-20T14:30:00Z"),
  "updatedAt": ISODate("2025-12-20T14:32:15Z")
}
```

### Sample User Scores Document
```javascript
{
  "_id": ObjectId("507f1f77bcf86cd799439012"),
  "userId": ObjectId("507f191e810c19729de860ea"),
  "scores": {
    "safetyScore": 87,
    "sustainabilityScore": 82,
    "efficiencyScore": 91
  },
  "level": "Orbital Optimizer",
  "badges": [
    {
      "id": "first_simulation",
      "name": "First Simulation",
      "earnedAt": ISODate("2025-12-19T10:15:00Z")
    },
    {
      "id": "low_risk_expert",
      "name": "Low Risk Expert",
      "earnedAt": ISODate("2025-12-20T09:45:00Z")
    },
    {
      "id": "ten_simulations",
      "name": "Simulation Specialist",
      "earnedAt": ISODate("2025-12-20T14:35:00Z")
    }
  ],
  "achievements": [
    {
      "id": "ten_simulations",
      "name": "Simulation Specialist",
      "description": "Run 10 simulations",
      "progress": 10,
      "target": 10,
      "earnedAt": ISODate("2025-12-20T14:35:00Z")
    },
    {
      "id": "perfect_safety",
      "name": "Perfect Safety",
      "description": "Achieve 100% safety score in 5 simulations",
      "progress": 3,
      "target": 5,
      "earnedAt": null
    }
  ],
  "totalSimulations": 12,
  "lastUpdated": ISODate("2025-12-20T14:35:00Z")
}
```

### Sample Scenario History Document
```javascript
{
  "_id": ObjectId("507f1f77bcf86cd799439013"),
  "userId": ObjectId("507f191e810c19729de860ea"),
  "simulationId": ObjectId("507f1f77bcf86cd799439011"),
  "scenarioName": "Starlink Satellite Launch",
  "eventType": "launch",
  "parametersSnapshot": {
    "altitude": 550,
    "inclination": 53,
    "velocity": 7.7,
    "mass": 260,
    "launchTime": ISODate("2025-12-20T14:30:00Z")
  },
  "createdAt": ISODate("2025-12-20T14:30:00Z"),
  "riskLevel": "medium",
  "congestionImpact": "low"
}
```

## Relationships Between Collections

```
users
  │
  ├── 1:N ── simulations (via userId)
  ├── 1:1 ── user_scores (via userId)
  └── 1:N ── scenario_history (via userId)
  
simulations
  │
  └── 1:1 ── scenario_history (via simulationId)
```

## Data Validation Rules

### Simulations Collection Validation
```javascript
db.createCollection("simulations", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "scenarioName", "eventType", "parameters", "results", "createdAt", "updatedAt"],
      properties: {
        userId: { bsonType: "objectId" },
        scenarioName: { bsonType: "string", minLength: 1, maxLength: 100 },
        eventType: { enum: ["launch", "adjustment", "breakup"] },
        "parameters.altitude": { bsonType: "number", minimum: 100, maximum: 5000 },
        "parameters.inclination": { bsonType: "number", minimum: 0, maximum: 180 },
        "parameters.velocity": { bsonType: "number", minimum: 0, maximum: 15 },
        "parameters.mass": { bsonType: "number", minimum: 1, maximum: 10000 },
        "parameters.launchTime": { bsonType: "date" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
})
```

### User Scores Collection Validation
```javascript
db.createCollection("user_scores", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "scores", "level", "badges", "achievements", "totalSimulations", "lastUpdated"],
      properties: {
        userId: { bsonType: "objectId" },
        "scores.safetyScore": { bsonType: "number", minimum: 0, maximum: 100 },
        "scores.sustainabilityScore": { bsonType: "number", minimum: 0, maximum: 100 },
        "scores.efficiencyScore": { bsonType: "number", minimum: 0, maximum: 100 },
        level: { enum: ["Safe Launcher", "Orbital Optimizer", "Space Sustainability Engineer"] },
        totalSimulations: { bsonType: "number", minimum: 0 },
        lastUpdated: { bsonType: "date" }
      }
    }
  }
})
```

### Scenario History Collection Validation
```javascript
db.createCollection("scenario_history", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "simulationId", "scenarioName", "eventType", "parametersSnapshot", "createdAt", "riskLevel", "congestionImpact"],
      properties: {
        userId: { bsonType: "objectId" },
        simulationId: { bsonType: "objectId" },
        scenarioName: { bsonType: "string", minLength: 1, maxLength: 100 },
        eventType: { enum: ["launch", "adjustment", "breakup"] },
        "parametersSnapshot.altitude": { bsonType: "number", minimum: 100, maximum: 5000 },
        "parametersSnapshot.inclination": { bsonType: "number", minimum: 0, maximum: 180 },
        "parametersSnapshot.velocity": { bsonType: "number", minimum: 0, maximum: 15 },
        "parametersSnapshot.mass": { bsonType: "number", minimum: 1, maximum: 10000 },
        "parametersSnapshot.launchTime": { bsonType: "date" },
        createdAt: { bsonType: "date" },
        riskLevel: { enum: ["low", "medium", "high"] },
        congestionImpact: { enum: ["low", "medium", "high"] }
      }
    }
  }
})
```