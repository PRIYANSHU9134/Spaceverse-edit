// Test to see what globals are available after loading libraries
console.log('=== Library Test ===');

// Check what's available in window object
const reactKeys = Object.keys(window).filter(key => key.includes('React'));
const threeKeys = Object.keys(window).filter(key => key.includes('Three') || key.includes('three'));
const fiberKeys = Object.keys(window).filter(key => key.includes('Fiber'));
const xrKeys = Object.keys(window).filter(key => key.includes('XR') || key.includes('xr'));

console.log('React-related keys:', reactKeys);
console.log('Three-related keys:', threeKeys);
console.log('Fiber-related keys:', fiberKeys);
console.log('XR-related keys:', xrKeys);

// Check specific objects
console.log('THREE:', typeof THREE);
console.log('React:', typeof React);
console.log('ReactDOM:', typeof ReactDOM);

// Try to find ReactThreeFiber and ReactThreeXR
if (typeof ReactThreeFiber !== 'undefined') {
    console.log('ReactThreeFiber found:', Object.keys(ReactThreeFiber));
} else {
    console.log('ReactThreeFiber not found');
}

if (typeof ReactThreeXR !== 'undefined') {
    console.log('ReactThreeXR found:', Object.keys(ReactThreeXR));
} else {
    console.log('ReactThreeXR not found');
}