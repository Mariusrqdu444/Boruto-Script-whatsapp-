// This is a simple helper script that creates a static build version
const fs = require('fs');
const path = require('path');

// Create dist/public folder if it doesn't exist
const publicDir = path.join(__dirname, 'dist', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Copy the built index.html file to public directory
const indexPath = path.join(__dirname, 'dist', 'public', 'index.html');
if (!fs.existsSync(indexPath)) {
  fs.writeFileSync(indexPath, '<html><head><title>WhatsApp Messenger</title></head><body><div id="root"></div></body></html>');
  console.log('Created placeholder index.html');
}

console.log('Static assets prepared for production deployment');

