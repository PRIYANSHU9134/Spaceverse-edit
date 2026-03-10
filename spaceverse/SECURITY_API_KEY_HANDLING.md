# Security and API Key Handling for Space Traffic Simulator

## Overview

This document outlines the security measures and API key handling strategies for the What-If Space Traffic Simulator, ensuring protection of user data and secure integration with external services.

## Security Architecture

### Multi-Layered Security Approach

1. **Network Security**
   - HTTPS encryption for all communications
   - Firewall rules restricting access to services
   - Rate limiting to prevent abuse

2. **Application Security**
   - Input validation and sanitization
   - Authentication and authorization
   - Secure session management

3. **Data Security**
   - Encryption at rest and in transit
   - Access control policies
   - Audit logging

4. **API Security**
   - Token-based authentication
   - API key rotation
   - Request signing for sensitive operations

## API Key Management

### Environment-Based API Keys

All API keys are stored in environment variables, never in source code:

```bash
# .env file (not committed to version control)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
NASA_API_KEY=DEMO_KEY
MONGODB_URI=mongodb+srv://...
SESSION_SECRET=supersecretkey
```

### Key Rotation Strategy

1. **Automated Rotation**:
   - Critical keys rotated every 90 days
   - Automated scripts for seamless transitions
   - Backup keys for emergency situations

2. **Manual Rotation**:
   - Emergency procedures for compromised keys
   - Documentation for manual key updates
   - Testing procedures for new keys

### Key Access Control

1. **Principle of Least Privilege**:
   - Services only receive keys they need
   - Restricted permissions for each key
   - Regular audit of key usage

2. **Service-Specific Keys**:
   - Separate keys for AI services
   - Different keys for different environments
   - Granular access control

## Authentication and Authorization

### User Authentication

Building on existing SpaceVerse authentication:

```javascript
// Session-based authentication (existing)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// Authentication middleware (existing)
function ensureAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ message: 'Authentication required' });
}
```

### API Authentication

For service-to-service communication:

```javascript
// API key authentication for internal services
function authenticateAPIKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
    return res.status(401).json({ message: 'Invalid API key' });
  }
  next();
}
```

### Role-Based Access Control

```javascript
// User roles
const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator'
};

// Role-based middleware
function requireRole(role) {
  return (req, res, next) => {
    if (!req.session.userRole || req.session.userRole !== role) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
}
```

## Data Protection

### Encryption

1. **Data in Transit**:
   - TLS 1.3 for all external communications
   - Internal service mesh with mutual TLS

2. **Data at Rest**:
   - MongoDB encryption at rest
   - Field-level encryption for sensitive data
   - Key management using cloud provider KMS

### Password Security

Building on existing bcrypt implementation:

```javascript
const bcrypt = require('bcryptjs');

// Password hashing (existing)
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Password verification (existing)
const isValid = await bcrypt.compare(password, hashedPassword);
```

### Session Security

Enhanced session management:

```javascript
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict' // CSRF protection
  },
  store: new MongoStore({ // Store sessions in MongoDB
    mongoUrl: process.env.MONGODB_URI,
    collection: 'sessions'
  })
}));
```

## Input Validation and Sanitization

### Request Validation

```javascript
const { body, validationResult } = require('express-validator');

// Validation middleware for simulation requests
const validateSimulation = [
  body('eventType').isIn(['launch', 'adjustment', 'breakup']).withMessage('Invalid event type'),
  body('parameters.altitude').isFloat({ min: 100, max: 5000 }).withMessage('Altitude must be between 100 and 5000 km'),
  body('parameters.inclination').isFloat({ min: 0, max: 180 }).withMessage('Inclination must be between 0 and 180 degrees'),
  body('parameters.velocity').isFloat({ min: 0, max: 15 }).withMessage('Velocity must be between 0 and 15 km/s'),
  body('parameters.mass').isFloat({ min: 1, max: 10000 }).withMessage('Mass must be between 1 and 10000 kg'),
  body('parameters.launchTime').isISO8601().withMessage('Invalid date format'),
  body('scenarioName').trim().isLength({ min: 1, max: 100 }).withMessage('Scenario name must be 1-100 characters')
];

// Validation error handler
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }
  next();
}
```

### Data Sanitization

```javascript
const sanitizeHtml = require('sanitize-html');

// Sanitize user inputs
function sanitizeInput(input) {
  return sanitizeHtml(input, {
    allowedTags: [], // No HTML tags allowed
    allowedAttributes: {}
  });
}

// Sanitize scenario names
app.use('/api/simulation', (req, res, next) => {
  if (req.body.scenarioName) {
    req.body.scenarioName = sanitizeInput(req.body.scenarioName);
  }
  next();
});
```

## Rate Limiting and Abuse Prevention

### API Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

// General API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// Strict rate limiting for simulation runs
const simulationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 simulations per hour
  message: 'Too many simulation requests. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', apiLimiter);
app.use('/api/simulation/run', simulationLimiter);
```

### Brute Force Protection

```javascript
const MongoStore = require('rate-limit-mongo');

// Store rate limit info in MongoDB
const mongoStore = new MongoStore({
  uri: process.env.MONGODB_URI,
  collection: 'rateLimits',
  expireTimeMs: 60 * 60 * 1000 // 1 hour
});

// Login rate limiting
const loginLimiter = rateLimit({
  store: mongoStore,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/login', loginLimiter);
```

## Cross-Site Scripting (XSS) Protection

### Content Security Policy

```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.openai.com"],
      fontSrc: ["'self'"]
    }
  }
}));
```

### Input Escaping

```javascript
// Escape HTML entities in user-generated content
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}
```

## Cross-Site Request Forgery (CSRF) Protection

```javascript
const csrf = require('csurf');

// CSRF protection middleware
const csrfProtection = csrf({ cookie: true });

// Add CSRF token to responses
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

// Apply CSRF protection to forms
app.use('/api/simulation', csrfProtection);
```

## Secure Headers

```javascript
app.use(helmet({
  // Hide Express header
  hidePoweredBy: true,
  
  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  
  // Prevent MIME type sniffing
  noSniff: true,
  
  // Prevent IE and Chrome from executing downloads
  ieNoOpen: true,
  
  // Prevent DNS prefetching
  dnsPrefetchControl: true
}));
```

## Error Handling Security

### Generic Error Messages

```javascript
// Don't expose internal details in error messages
app.use((err, req, res, next) => {
  console.error(err); // Log full error internally
  
  // Send generic message to client
  res.status(500).json({ 
    success: false, 
    message: 'An error occurred while processing your request' 
  });
});
```

### Error Logging

```javascript
const winston = require('winston');

// Secure error logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## Microservice Security

### Internal Service Communication

```python
# Python AI service security
import os
import hashlib
import hmac
from functools import wraps
from flask import request, jsonify

def verify_internal_request(f):
    """Verify requests from internal services"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get signature from header
        signature = request.headers.get('X-Signature')
        if not signature:
            return jsonify({'error': 'Missing signature'}), 401
        
        # Recalculate signature
        expected_signature = hmac.new(
            os.environ['INTERNAL_API_SECRET'].encode(),
            request.data,
            hashlib.sha256
        ).hexdigest()
        
        # Compare signatures
        if not hmac.compare_digest(signature, expected_signature):
            return jsonify({'error': 'Invalid signature'}), 401
            
        return f(*args, **kwargs)
    return decorated_function

@app.route('/ai/simulate-impact', methods=['POST'])
@verify_internal_request
def simulate_impact():
    # Process request
    pass
```

### Service Mesh (Future Enhancement)

For production deployments:
- Istio or Linkerd for service-to-service security
- Mutual TLS between services
- Fine-grained access control policies

## Compliance Considerations

### GDPR Compliance

1. **Data Minimization**: Only collect necessary user data
2. **Right to Erasure**: Implement user data deletion
3. **Data Portability**: Allow data export in standard formats
4. **Privacy by Design**: Incorporate privacy considerations from the start

### COPPA Compliance

If targeting children under 13:
- Parental consent mechanisms
- Limited data collection
- No behavioral advertising

## Security Testing

### Automated Security Scanning

```bash
# Dependency vulnerability scanning
npm audit

# Static code analysis
npm install -g eslint-plugin-security
eslint --plugin security .

# Dynamic application security testing
# Tools like OWASP ZAP, Burp Suite
```

### Penetration Testing

Regular penetration testing schedule:
- Quarterly automated scans
- Annual manual penetration tests
- Bug bounty program consideration

## Incident Response

### Security Incident Procedure

1. **Detection**: Monitor logs for suspicious activity
2. **Containment**: Isolate affected systems
3. **Eradication**: Remove threat and vulnerabilities
4. **Recovery**: Restore systems from clean backups
5. **Lessons Learned**: Update procedures and prevent recurrence

### Key Contact Information

- Security Team: security@spaceverse.example.com
- Emergency: +1-XXX-XXX-XXXX (24/7)
- Abuse Reports: abuse@spaceverse.example.com

## Monitoring and Auditing

### Security Monitoring

```javascript
// Log security-relevant events
const securityLogger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'security.log' })
  ]
});

// Log authentication events
app.post('/api/login', (req, res) => {
  securityLogger.info('Login attempt', {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
});
```

### Regular Security Audits

- Monthly vulnerability scans
- Quarterly security assessments
- Annual third-party security audits
- Continuous monitoring of dependencies

## Conclusion

This comprehensive security approach ensures:
1. **User Data Protection**: Strong encryption and access controls
2. **API Security**: Robust authentication and rate limiting
3. **Application Resilience**: Input validation and error handling
4. **Compliance**: Adherence to relevant regulations
5. **Monitoring**: Continuous security monitoring and auditing

The layered approach provides defense in depth while maintaining usability for the educational purpose of the Space Traffic Simulator.