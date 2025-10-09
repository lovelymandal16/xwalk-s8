/**
 * Form Event Buffer Plugin - Loads Official Helix RUM Enhancer Plugins
 * 
 * This plugin loads the official helix-rum-enhancer plugins when RUM is not selected,
 * allowing them to handle all form event tracking automatically.
 * 
 * Based on the approach from helix-rum-js/src/form-tracker.js
 */

console.log('📦 Form Event Buffer Plugin: File loaded');
console.log('🔍 Debug: Current URL:', window.location.href);
console.log('🔍 Debug: Forms on page:', document.querySelectorAll('form').length);
console.log('🔍 Debug: RUM system available:', !!(window.hlx && window.hlx.rum));

/**
 * Load helix-rum-enhancer when RUM is not selected
 * Based on the sampleRUM.enhance approach
 */
async function loadHelixRumEnhancerPlugins(context) {
  console.log('🔍 Loading helix-rum-enhancer...');
  
  // Disable automatic rum-enhancer loading to prevent conflicts
  (window.hlx = window.hlx || {}).RUM_MANUAL_ENHANCE = true;
  
  try {
    // Create sampleRUM function if it doesn't exist
    if (!window.sampleRUM) {
      window.sampleRUM = function(checkpoint, data) {
        // Basic sampleRUM implementation for non-sampled users
        console.log('📊 sampleRUM:', checkpoint, data);
      };
    }
    
    // Set up base URLs
    window.sampleRUM.baseURL = window.sampleRUM.baseURL || new URL(window.RUM_BASE || '/', new URL('https://rum.hlx.page'));
    window.sampleRUM.collectBaseURL = window.sampleRUM.collectBaseURL || window.sampleRUM.baseURL;
    
    // Load the RUM enhancer
    const { enhancerVersion, enhancerHash } = window.sampleRUM.enhancerContext || {};
    const script = document.createElement('script');
    if (enhancerHash) {
      script.integrity = enhancerHash;
      script.setAttribute('crossorigin', 'anonymous');
    }
    script.src = new URL(`.rum/@adobe/helix-rum-enhancer@${enhancerVersion || '^2'}/src/index.js`, window.sampleRUM.baseURL).href;
    
    // Wait for script to load
    await new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    
    console.log('✅ Helix RUM Enhancer loaded successfully');
    
  } catch (error) {
    console.error('❌ Failed to load helix-rum-enhancer:', error);
    throw error;
  }
}


/**
 * Initialize form event buffer plugin
 * @param {Object} config - Plugin configuration
 * @param {Function} config.sampleRUM - The sampleRUM function
 * @param {Element} config.context - The context element to search for forms
 */
export default async function addFormEventBuffer({ sampleRUM, context = document.body }) {
  console.log('🔍 Form Event Buffer Plugin: Initializing for non-sampled user', {
    hasRUM: !!(window.hlx && window.hlx.rum),
    hasCollector: !!(window.hlx && window.hlx.rum && window.hlx.rum.collector),
    isSelected: window.hlx?.rum?.isSelected,
    context: context
  });
  
  // Only activate the plugin if RUM is NOT selected (not sampled)
  if (window.hlx?.rum?.isSelected === true) {
    console.log('📊 RUM is selected (sampled), Form Event Buffer Plugin will not activate');
    return;
  }
  
  try {
    // Load the official helix-rum-enhancer plugins
    await loadHelixRumEnhancerPlugins(context);
    console.log('✅ Form Event Buffer Plugin: Initialized successfully with official enhancer plugins');
  } catch (error) {
    console.error('❌ Form Event Buffer Plugin: Failed to load official enhancer plugins:', error);
    console.log('📝 Form Event Buffer Plugin: No fallback implementation - enhancer plugins are required');
  }
}

/**
 * Debug function to check localStorage contents
 */
window.debugFormEventBuffer = function() {
  console.log('🔍 Debug: Checking localStorage for form events...');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes('helix-rum')) {
      console.log(`📦 ${key}:`, JSON.parse(localStorage.getItem(key)));
    }
  }
};

/**
 * Debug function to simulate form events for testing
 */
window.debugSimulateFormEvents = function() {
  console.log('🧪 Simulating form events for debugging...');
  
  // Simulate a view block event
  if (window.sampleRUM) {
    window.sampleRUM('viewblock', { source: 'form', target: 'form' });
  }
  
  // Simulate a click event
  if (window.sampleRUM) {
    window.sampleRUM('click', { source: 'form input[type="text"]' });
  }
  
  // Simulate a fill event
  if (window.sampleRUM) {
    window.sampleRUM('fill', { source: 'form input[type="text"]' });
  }
  
  console.log('🧪 Simulated events sent. Check with: window.debugFormEventBuffer()');
};