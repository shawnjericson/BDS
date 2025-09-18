const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 8080;

// Simple HTTP server
const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  
  // Security check
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  
  const extname = path.extname(filePath);
  let contentType = 'text/html';
  
  switch (extname) {
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    case '.json':
      contentType = 'application/json';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.jpg':
      contentType = 'image/jpg';
      break;
  }
  
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(500);
        res.end('Server error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log('🌐 Web Test Server Started!');
  console.log(`📱 URL: http://localhost:${PORT}`);
  console.log('🔧 Testing BDS Login & Logout functionality');
  console.log('');
  console.log('📋 Test Accounts:');
  console.log('   admin@example.com / 123456');
  console.log('   manager@example.com / 123456');
  console.log('   provider@example.com / 123456');
  console.log('');
  console.log('✅ Features to test:');
  console.log('   - Login with JWT token');
  console.log('   - User profile with relationships');
  console.log('   - Logout (clear localStorage)');
  console.log('   - Auto-login on page refresh');
  console.log('');
  console.log('🛑 Press Ctrl+C to stop server');
  
  // Try to open browser automatically
  const url = `http://localhost:${PORT}`;
  const start = process.platform === 'darwin' ? 'open' : 
                process.platform === 'win32' ? 'start' : 'xdg-open';
  
  exec(`${start} ${url}`, (error) => {
    if (error) {
      console.log(`\n🔗 Please open manually: ${url}`);
    } else {
      console.log('\n🚀 Browser opened automatically!');
    }
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down web test server...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});
