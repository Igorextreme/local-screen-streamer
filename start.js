
const { spawn } = require('child_process');
const path = require('path');

// Start the Express server
console.log('Starting Express server...');
const serverProcess = spawn('node', ['src/server/server.js'], {
  stdio: 'inherit',
  shell: true
});

// Give the server a moment to start before launching the frontend
console.log('Waiting for server to initialize...');
setTimeout(() => {
  // Start the Vite dev server
  console.log('Starting Vite dev server...');
  const viteProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true
  });

  // Handle exit
  process.on('SIGINT', () => {
    console.log('Shutting down all processes...');
    serverProcess.kill('SIGINT');
    viteProcess.kill('SIGINT');
    process.exit();
  });
}, 2000); // Wait 2 seconds before starting the frontend

