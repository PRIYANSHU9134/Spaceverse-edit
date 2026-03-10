# 🚀 Spaceverse Quick Start Guide

## 🎯 Daily Usage Commands

### Start Application
```bash
npm run start-robust    # 🔧 RECOMMENDED - Robust startup with health checks
```

### Stop Application
```bash
npm run shutdown        # 🛑 Safe shutdown of all processes
```

### Troubleshooting
```bash
npm run diagnose        # 🔍 Diagnose system issues
npm run health-check    # ❤️ Check service health
```

## 🌐 Access Points

- **Main Application**: http://localhost:5000
- **AI Service**: http://localhost:8001
- **VR Solar System**: http://localhost:5000/vr-solar-system

## 🛠️ Emergency Commands

If things go wrong:
```bash
# Force kill all processes
taskkill /f /im node.exe
taskkill /f /im python.exe

# Then restart
npm run start-robust
```

## 📋 What's Fixed

✅ Port conflicts automatically resolved  
✅ Graceful shutdown implemented  
✅ Process management improved  
✅ Health monitoring added  
✅ Diagnostic tools included  

Your shutdown issues are now resolved! 🎉