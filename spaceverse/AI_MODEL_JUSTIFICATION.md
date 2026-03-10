# AI Model Choice Justification for Space Traffic Simulator

## Overview

This document provides justification for the selection of machine learning models used in the What-If Space Traffic Simulator's AI prediction service.

## Problem Requirements

The AI service must predict:
1. **Collision risk percentage** (0-100%)
2. **Orbital congestion increase** (percentage)
3. **Secondary debris probability** (0-100%)
4. Provide **confidence levels** for predictions
5. Offer **explainable results** for educational purposes

## Selected Models

### Primary Model: Random Forest Regressor

#### Why Random Forest?

1. **Explainability**: Random Forest provides feature importance scores, making it easier to explain predictions
2. **Robustness**: Handles outliers and noisy data well, which is common in space environment data
3. **Non-linear Relationships**: Can capture complex relationships between orbital parameters and risks
4. **Ensemble Method**: Combines multiple decision trees for better generalization
5. **Feature Handling**: Works well with mixed data types (numerical orbital parameters)
6. **Performance**: Good balance between accuracy and computational efficiency

#### Implementation Details

```python
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score

# Model parameters optimized for explainability and performance
model = RandomForestRegressor(
    n_estimators=100,        # Number of trees in the forest
    max_depth=10,            # Maximum depth of trees
    min_samples_split=5,     # Minimum samples required to split a node
    min_samples_leaf=2,      # Minimum samples required at leaf node
    random_state=42,         # For reproducible results
    n_jobs=-1               # Use all available processors
)
```

#### Features Used

1. **Orbital Parameters**:
   - Altitude (km)
   - Inclination (degrees)
   - Velocity (km/s)
   - Mass (kg)

2. **Environmental Factors**:
   - Objects in similar orbits
   - Density of orbital band
   - Time of launch (seasonal factors)

3. **Event Characteristics**:
   - Event type (launch/adjustment/breakup)
   - Number of objects created (for breakup events)

#### Output Interpretation

Random Forest provides:
- **Prediction values** for each risk metric
- **Confidence intervals** based on tree variance
- **Feature importance** for explainability

### Secondary Model: Linear Regression (Baseline)

#### Why Linear Regression?

1. **Baseline Comparison**: Provides a simple baseline for model performance
2. **Interpretability**: Clear coefficients show direct relationships
3. **Speed**: Extremely fast training and inference
4. **Debugging**: Easy to debug and understand failures

#### Implementation Details

```python
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler

# Preprocessing for linear model
scaler = StandardScaler()

# Simple linear model for baseline
baseline_model = LinearRegression()
```

## Model Training Approach

### Data Sources

1. **Historical Space Data**:
   - Satellite catalog data from SSA (Space Situational Awareness)
   - Historical collision events
   - Debris generation statistics

2. **Simulated Scenarios**:
   - Physics-based orbital mechanics simulations
   - Monte Carlo sampling of parameter spaces
   - Edge case scenarios for robustness

### Feature Engineering

1. **Orbital Band Classification**:
   - LEO: < 2000 km
   - MEO: 2000-35786 km
   - GEO: ≈ 35786 km

2. **Density Calculations**:
   - Objects per 100km³ in orbital band
   - Proximity metrics to nearest neighbors

3. **Relative Motion Features**:
   - Relative velocity vectors
   - Conjunction rates
   - Crossing angles

### Training Process

1. **Data Splitting**:
   - 70% training
   - 15% validation
   - 15% testing

2. **Cross-Validation**:
   - 5-fold cross-validation for robust evaluation
   - Stratified sampling by orbital regime

3. **Hyperparameter Tuning**:
   - Grid search for optimal parameters
   - Bayesian optimization for efficiency

### Evaluation Metrics

1. **Primary Metrics**:
   - Mean Squared Error (MSE)
   - R² Score
   - Mean Absolute Error (MAE)

2. **Domain-Specific Metrics**:
   - Risk ranking accuracy
   - False positive/negative rates for high-risk scenarios
   - Calibration of confidence scores

## Explainability Approach

### SHAP (SHapley Additive exPlanations)

Used to explain individual predictions:

```python
import shap

# Create explainer
explainer = shap.TreeExplainer(model)

# Calculate SHAP values
shap_values = explainer.shap_values(input_features)

# Generate explanation
explanation = generate_explanation(shap_values, feature_names)
```

### Feature Importance Visualization

1. **Global Importance**:
   - Overall feature impact across all predictions
   - Helps identify key risk factors

2. **Local Importance**:
   - Per-prediction feature contributions
   - Enables personalized explanations

## Confidence Estimation

### Ensemble Variance Method

Using the Random Forest's inherent ensemble nature:

```python
# Get predictions from all trees
predictions = [tree.predict(sample) for tree in model.estimators_]

# Calculate statistics
mean_prediction = np.mean(predictions)
prediction_std = np.std(predictions)

# Convert to confidence score (0-100)
confidence = 100 * (1 - prediction_std / mean_prediction)
```

### Prediction Intervals

95% prediction intervals using quantiles:
- Lower bound: 2.5th percentile
- Upper bound: 97.5th percentile

## Model Limitations and Mitigations

### Limitations

1. **Data Availability**: Limited real-world collision data
2. **Long-term Effects**: Models focus on immediate impacts
3. **Complex Interactions**: Some cascading effects are difficult to model
4. **Novel Scenarios**: May struggle with unprecedented events

### Mitigations

1. **Synthetic Data Generation**: Physics-based simulations to augment training data
2. **Uncertainty Quantification**: Explicit confidence scores
3. **Continuous Learning**: Regular model updates with new data
4. **Expert Validation**: Domain expert review of critical predictions
5. **Conservative Estimates**: Bias toward higher risk estimates for safety

## Alternative Considered Models

### Support Vector Regression (SVR)

**Pros**:
- Effective in high-dimensional spaces
- Memory efficient
- Versatile kernel functions

**Cons**:
- Poor scalability with dataset size
- Difficult to interpret
- Requires careful parameter tuning

**Decision**: Not selected due to scalability concerns and lack of explainability.

### Gradient Boosting (XGBoost/LightGBM)

**Pros**:
- Often higher accuracy than Random Forest
- Good handling of missing values
- Built-in regularization

**Cons**:
- More prone to overfitting
- Less parallelizable
- Harder to explain individual predictions

**Decision**: Considered but Random Forest chosen for better explainability and robustness.

### Neural Networks

**Pros**:
- Can capture complex non-linear relationships
- Flexible architecture options

**Cons**:
- Black box nature conflicts with explainability requirement
- Requires large amounts of data
- Computationally expensive to train

**Decision**: Not suitable for this educational application requiring transparency.

## Model Deployment Strategy

### Containerization

Deploy using Docker for consistency:
```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "ai_service.py"]
```

### API Framework

FastAPI for high-performance REST API:
```python
from fastapi import FastAPI

app = FastAPI(title="Space Traffic AI Service")

@app.post("/ai/simulate-impact")
async def simulate_impact(request: SimulationRequest):
    # Process request
    # Run predictions
    # Return results with explanations
    pass
```

### Monitoring

1. **Performance Metrics**:
   - Response time
   - Throughput
   - Error rates

2. **Prediction Quality**:
   - Drift detection
   - Accuracy monitoring
   - Confidence distribution

3. **Resource Usage**:
   - CPU/Memory utilization
   - Disk I/O

## Future Improvements

1. **Deep Learning Integration**: For complex pattern recognition in large scenarios
2. **Reinforcement Learning**: For adaptive risk mitigation recommendations
3. **Bayesian Approaches**: For better uncertainty quantification
4. **Transfer Learning**: From terrestrial traffic management systems
5. **Real-time Data Integration**: Live satellite tracking feeds

## Conclusion

The Random Forest Regressor provides the optimal balance of:
- **Accuracy**: Sufficient for risk assessment purposes
- **Explainability**: Critical for educational and decision-support goals
- **Performance**: Fast enough for interactive use
- **Maintainability**: Simple to understand, debug, and improve

Combined with SHAP for explainability and proper confidence estimation, this approach meets all requirements for the Space Traffic Simulator while remaining accessible to students and educators.