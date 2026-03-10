import requests
import time

try:
    print("Testing Main Application homepage...")
    response = requests.get('http://localhost:5004/', timeout=5)
    print(f"Status Code: {response.status_code}")
    print(f"Response length: {len(response.text)} characters")
    if response.status_code == 200:
        print("✅ Main Application is working correctly!")
    else:
        print(f"⚠️  Main Application returned status code {response.status_code}")
except Exception as e:
    print(f"❌ Error connecting to Main Application: {e}")
    print("Please make sure the main application is running on port 5004")