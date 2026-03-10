import requests
import time

try:
    print("Testing AI Service health endpoint...")
    response = requests.get('http://localhost:8001/health', timeout=5)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    print("✅ AI Service is working correctly!")
except Exception as e:
    print(f"❌ Error connecting to AI Service: {e}")
    print("Please make sure the AI service is running on port 8001")