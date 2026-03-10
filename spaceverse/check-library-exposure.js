// Script to check how UMD libraries expose themselves
console.log('=== Library Exposure Check ===');

// Function to check for a library in various ways
function checkLibrary(name, possibleNames) {
    console.log(`\n--- Checking ${name} ---`);
    
    // Check direct global access
    if (window[name]) {
        console.log(`✅ Direct access: window.${name} is available`);
        if (typeof window[name] === 'object') {
            console.log(`   Keys: ${Object.keys(window[name]).slice(0, 10).join(', ')}`);
        }
    } else {
        console.log(`❌ Direct access: window.${name} not found`);
    }
    
    // Check possible alternative names
    for (const altName of possibleNames) {
        if (window[altName]) {
            console.log(`✅ Alternative access: window.${altName} is available`);
            if (typeof window[altName] === 'object') {
                console.log(`   Keys: ${Object.keys(window[altName]).slice(0, 10).join(', ')}`);
            }
        }
    }
    
    // Check for partial matches in window properties
    const windowKeys = Object.keys(window);
    const matches = windowKeys.filter(key => 
        key.toLowerCase().includes(name.toLowerCase().replace(/\s+/g, '')) ||
        name.toLowerCase().includes(key.toLowerCase().replace(/\s+/g, ''))
    );
    
    if (matches.length > 0) {
        console.log(`🔍 Possible matches in window: ${matches.join(', ')}`);
        matches.forEach(match => {
            if (typeof window[match] === 'object') {
                console.log(`   ${match} keys: ${Object.keys(window[match]).slice(0, 5).join(', ')}`);
            }
        });
    }
}

// Check all libraries after they load
setTimeout(() => {
    checkLibrary('THREE', ['THREE']);
    checkLibrary('ReactThreeFiber', ['Fiber', 'ReactThreeFiber', 'reactThreeFiber']);
    checkLibrary('ReactThreeXR', ['XR', 'ReactThreeXR', 'reactThreeXR', 'WebXR']);
    
    // Also check for any property containing 'fiber' or 'xr'
    console.log('\n--- Searching for fiber/xr related properties ---');
    const allKeys = Object.keys(window);
    const fiberKeys = allKeys.filter(key => key.toLowerCase().includes('fiber'));
    const xrKeys = allKeys.filter(key => key.toLowerCase().includes('xr'));
    
    if (fiberKeys.length > 0) {
        console.log(`🔍 Fiber-related keys: ${fiberKeys.join(', ')}`);
    }
    if (xrKeys.length > 0) {
        console.log(`🔍 XR-related keys: ${xrKeys.join(', ')}`);
    }
    
    console.log('\n=== End Check ===');
}, 3000); // Wait for libraries to load