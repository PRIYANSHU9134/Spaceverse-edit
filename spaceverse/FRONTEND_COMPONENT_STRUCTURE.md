# Frontend Component Structure for Space Traffic Simulator

## Overview

This document outlines the frontend component structure for the What-If Space Traffic Simulator, designed to integrate seamlessly with the existing SpaceVerse application.

## Component Hierarchy

```
SpaceTrafficSimulator/
├── ScenarioBuilder/
│   ├── ScenarioForm/
│   │   ├── EventTypeSelector/
│   │   ├── ParameterControls/
│   │   │   ├── AltitudeSlider/
│   │   │   ├── InclinationSlider/
│   │   │   ├── VelocitySlider/
│   │   │   ├── MassSlider/
│   │   │   └── LaunchTimePicker/
│   │   └── PreviewOrbit/
│   ├── RunSimulationButton/
│   └── ScenarioHistory/
├── SimulationResults/
│   ├── BeforeAfterComparison/
│   │   ├── BeforeState/
│   │   └── AfterState/
│   ├── RiskVisualization/
│   │   ├── CollisionRiskChart/
│   │   ├── CongestionHeatmap/
│   │   └── DebrisProbabilityIndicator/
│   ├── AIExplanation/
│   └── Recommendations/
├── GamificationPanel/
│   ├── UserScores/
│   ├── LevelIndicator/
│   ├── BadgesDisplay/
│   └── Leaderboard/
└── Navigation/
    ├── SpaceVerseNavIntegration/
    └── SimulatorTabs/
```

## Component Details

### 1. ScenarioBuilder Component

The main container for creating new space traffic scenarios.

#### Props
```javascript
{
  userId: string, // Current user ID
  onScenarioSubmit: function, // Callback when scenario is submitted
  isAuthenticated: boolean // Whether user is logged in
}
```

#### State
```javascript
{
  eventType: string, // "launch" | "adjustment" | "breakup"
  parameters: {
    altitude: number, // km
    inclination: number, // degrees
    velocity: number, // km/s
    mass: number, // kg
    launchTime: Date // ISO string
  },
  scenarioName: string,
  isSubmitting: boolean,
  submitError: string
}
```

### 2. EventTypeSelector Component

Allows users to select the type of space event to simulate.

#### Props
```javascript
{
  selectedType: string,
  onChange: function
}
```

#### State
```javascript
{
  eventTypes: [
    { id: "launch", name: "New Satellite Launch", icon: "🚀" },
    { id: "adjustment", name: "Orbit Adjustment", icon: " maneu" },
    { id: "breakup", name: "Satellite Breakup", icon: "💥" }
  ]
}
```

### 3. ParameterControls Component

Container for all parameter input controls.

#### Props
```javascript
{
  eventType: string,
  parameters: object,
  onChange: function
}
```

### 4. AltitudeSlider Component

Slider for setting satellite altitude.

#### Props
```javascript
{
  value: number,
  onChange: function,
  min: number, // 100
  max: number, // 5000
  unit: string // "km"
}
```

#### State
```javascript
{
  currentValue: number
}
```

### 5. InclinationSlider Component

Slider for setting orbital inclination.

#### Props
```javascript
{
  value: number,
  onChange: function,
  min: number, // 0
  max: number, // 180
  unit: string // "degrees"
}
```

#### State
```javascript
{
  currentValue: number
}
```

### 6. VelocitySlider Component

Slider for setting satellite velocity.

#### Props
```javascript
{
  value: number,
  onChange: function,
  min: number, // 0
  max: number, // 15
  unit: string // "km/s"
}
```

#### State
```javascript
{
  currentValue: number
}
```

### 7. MassSlider Component

Slider for setting satellite mass.

#### Props
```javascript
{
  value: number,
  onChange: function,
  min: number, // 1
  max: number, // 10000
  unit: string // "kg"
}
```

#### State
```javascript
{
  currentValue: number
}
```

### 8. LaunchTimePicker Component

Date/time picker for setting launch time.

#### Props
```javascript
{
  value: Date,
  onChange: function
}
```

#### State
```javascript
{
  currentDate: Date
}
```

### 9. PreviewOrbit Component

Visual preview of the proposed orbit around Earth.

#### Props
```javascript
{
  parameters: object,
  eventType: string
}
```

#### State
```javascript
{
  orbitPath: array, // Array of 3D coordinates
  satellitePosition: object // {x, y, z}
}
```

### 10. RunSimulationButton Component

Button to execute the simulation.

#### Props
```javascript
{
  onClick: function,
  disabled: boolean,
  isLoading: boolean
}
```

#### State
```javascript
{
  buttonText: string // "Run Simulation" | "Running..."
}
```

### 11. ScenarioHistory Component

Displays history of previous scenarios.

#### Props
```javascript
{
  scenarios: array,
  onSelectScenario: function
}
```

#### State
```javascript
{
  displayedScenarios: array
}
```

### 12. SimulationResults Component

Container for displaying simulation results.

#### Props
```javascript
{
  simulationData: object,
  aiAnalysis: object
}
```

#### State
```javascript
{
  activeTab: string // "comparison" | "risk" | "explanation"
}
```

### 13. BeforeAfterComparison Component

Side-by-side comparison of space traffic before and after the scenario.

#### Props
```javascript
{
  beforeState: object,
  afterState: object
}
```

### 14. BeforeState Component

Displays the state of space traffic before the scenario.

#### Props
```javascript
{
  stateData: object
}
```

### 15. AfterState Component

Displays the state of space traffic after the scenario.

#### Props
```javascript
{
  stateData: object
}
```

### 16. RiskVisualization Component

Container for various risk visualization components.

#### Props
```javascript
{
  riskData: object
}
```

### 17. CollisionRiskChart Component

Chart showing collision risk percentage.

#### Props
```javascript
{
  riskPercentage: number
}
```

### 18. CongestionHeatmap Component

Heatmap visualization of orbital congestion.

#### Props
```javascript
{
  congestionData: object
}
```

### 19. DebrisProbabilityIndicator Component

Indicator showing probability of secondary debris.

#### Props
```javascript
{
  probability: number
}
```

### 20. AIExplanation Component

Natural language explanation of simulation results.

#### Props
```javascript
{
  explanation: string,
  recommendations: array
}
```

### 21. Recommendations Component

Actionable recommendations based on simulation results.

#### Props
```javascript
{
  recommendations: array
}
```

### 22. GamificationPanel Component

Container for gamification features.

#### Props
```javascript
{
  userData: object
}
```

### 23. UserScores Component

Display of user's current scores.

#### Props
```javascript
{
  scores: object
}
```

### 24. LevelIndicator Component

Shows user's current level and progress.

#### Props
```javascript
{
  level: string,
  progress: number // 0-100
}
```

### 25. BadgesDisplay Component

Display of earned badges.

#### Props
```javascript
{
  badges: array
}
```

### 26. Leaderboard Component

Top users leaderboard.

#### Props
```javascript
{
  leaderboard: array,
  currentUser: object
}
```

### 27. Navigation Component

Navigation elements for the simulator.

#### Props
```javascript
{
  activeTab: string,
  onChangeTab: function
}
```

### 28. SpaceVerseNavIntegration Component

Integration with existing SpaceVerse navigation.

#### Props
```javascript
{
  onNavigateToMainApp: function
}
```

### 29. SimulatorTabs Component

Tabbed interface for different simulator sections.

#### Props
```javascript
{
  activeTab: string,
  tabs: array,
  onChangeTab: function
}
```

## Styling Approach

All components will follow the existing SpaceVerse design system:
- Color palette: Dark space theme with accent colors
- Typography: Modern sans-serif fonts
- Spacing: Consistent padding and margins
- Responsiveness: Mobile-first approach
- Animations: Subtle transitions for state changes

## Integration Points

1. **Authentication**: Components will check for user authentication status
2. **API Communication**: Components will communicate with backend services via REST APIs
3. **State Management**: React Context API or Redux for global state management
4. **3D Visualization**: Integration with existing Three.js engine for orbit previews
5. **Routing**: React Router for navigation between simulator sections

## Performance Considerations

1. **Lazy Loading**: Components loaded only when needed
2. **Memoization**: React.memo for performance optimization
3. **Virtual Scrolling**: For large lists like scenario history
4. **Code Splitting**: Bundle splitting for faster initial loads
5. **Caching**: Client-side caching of simulation results