
const { spawn } = require('child_process');
const path = require('path');

// Start the Express server
const serverProcess = spawn('node', ['src/server/server.js'], {
  stdio: 'inherit',
  shell: true
});

// Start the Vite dev server
const viteProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

// Handle exit
process.on('SIGINT', () => {
  serverProcess.kill('SIGINT');
  viteProcess.kill('SIGINT');
  process.exit();
});
