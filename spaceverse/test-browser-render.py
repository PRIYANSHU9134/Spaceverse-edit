import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by_tag_name import By
import time
import os

def test_vr_rendering():
    print("🧪 Browser Rendering Test for VR Page")
    print("=" * 50)
    
    # Set up Chrome options for headless testing
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    try:
        # Initialize the driver
        driver = webdriver.Chrome(options=chrome_options)
        
        # Navigate to the VR page
        print("🌐 Loading VR page...")
        driver.get("http://localhost:5001/vr-solar-system.html")
        
        # Wait for page to load
        time.sleep(5)
        
        # Check page title
        title = driver.title
        print(f"📄 Page Title: {title}")
        
        # Check if the container exists
        try:
            container = driver.find_element(By.ID, "vr-container")
            print("✅ VR Container found in DOM")
            
            # Check if container has children (indicating rendered content)
            children = container.find_elements(By.XPATH, "./*")
            print(f"📦 Container children: {len(children)}")
            
            if len(children) > 0:
                print("✅ Content rendered in container")
            else:
                print("⚠️  Container is empty (no rendered content)")
                
        except Exception as e:
            print(f"❌ VR Container not found: {e}")
        
        # Check for JavaScript errors
        logs = driver.get_log('browser')
        js_errors = [log for log in logs if log['level'] == 'SEVERE']
        
        if js_errors:
            print("\n❌ JavaScript Errors Found:")
            for error in js_errors:
                print(f"  - {error['message']}")
        else:
            print("\n✅ No JavaScript errors found")
            
        # Check for warnings
        js_warnings = [log for log in logs if log['level'] == 'WARNING']
        if js_warnings:
            print("\n⚠️  JavaScript Warnings:")
            for warning in js_warnings:
                print(f"  - {warning['message']}")
        
        # Print all console logs for debugging
        if logs:
            print("\n📋 Console Logs:")
            for log in logs:
                print(f"  [{log['level']}] {log['message']}")
        
        driver.quit()
        
    except Exception as e:
        print(f"❌ Error during browser test: {e}")
        print("💡 Make sure ChromeDriver is installed and in PATH")
        
    print("\n" + "=" * 50)
    print("💡 Common causes for empty VR page:")
    print("   1. Babel not transforming JSX properly")
    print("   2. External library loading issues")
    print("   3. WebGL context problems")
    print("   4. CORS restrictions")
    print("   5. Missing polyfills for older browsers")

if __name__ == "__main__":
    test_vr_rendering()