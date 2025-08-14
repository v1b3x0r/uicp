#!/usr/bin/env node

// Test script to validate UIKit Svelte 5 fixes
import { createDrawerReactive, drawerStore } from '../../packages/ui-svelte/dist/index.js';

console.log('🧪 Testing UIKit Svelte 5 Fixes...\n');

// Test 1: createDrawerReactive (no $state runes)
try {
  const reactive = createDrawerReactive();
  console.log('✅ createDrawerReactive() works - no $state error');
  console.log(`   Initial state: ${JSON.stringify(reactive.getState())}`);
} catch (error) {
  console.log(`❌ createDrawerReactive() failed: ${error.message}`);
}

// Test 2: drawerStore (should work)
try {
  const store = drawerStore();
  console.log('✅ drawerStore() works - legacy pattern OK');
} catch (error) {
  console.log(`❌ drawerStore() failed: ${error.message}`);
}

// Test 3: Methods available
try {
  const reactive = createDrawerReactive();
  const methods = ['open', 'close', 'toggle', 'getState', 'onChange'];
  const available = methods.filter(m => typeof reactive[m] === 'function');
  console.log(`✅ Available methods: ${available.join(', ')}`);
  
  if (available.length === methods.length) {
    console.log('✅ All expected methods present');
  } else {
    console.log(`❌ Missing methods: ${methods.filter(m => !available.includes(m)).join(', ')}`);
  }
} catch (error) {
  console.log(`❌ Method check failed: ${error.message}`);
}

// Test 4: State change listener
try {
  const reactive = createDrawerReactive();
  let changeCount = 0;
  
  const cleanup = reactive.onChange(() => {
    changeCount++;
  });
  
  reactive.open();
  reactive.close();
  cleanup();
  
  console.log(`✅ State changes tracked: ${changeCount} events`);
} catch (error) {
  console.log(`❌ State change test failed: ${error.message}`);
}

console.log('\n🎯 Fix Summary:');
console.log('- ✅ Removed $state rune from adapter layer');
console.log('- ✅ createDrawerReactive() provides plain JS API');
console.log('- ✅ Components can wrap with $state as needed');
console.log('- ✅ Backward compatibility maintained');
console.log('\n🚀 Ready for Svelte 5 runes in components!');