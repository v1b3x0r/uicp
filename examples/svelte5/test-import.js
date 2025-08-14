// Test direct import resolution
console.log('Testing direct import...');

try {
  const module = await import('../../packages/ui-svelte/dist/index.js');
  console.log('✅ Direct import works');
  console.log('Available exports:', Object.keys(module));
} catch (error) {
  console.log('❌ Direct import failed:', error.message);
}