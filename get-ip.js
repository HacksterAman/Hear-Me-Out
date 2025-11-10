// Quick script to find your local IP address
// Run with: node get-ip.js

const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  return 'localhost';
}

const ip = getLocalIP();
console.log('\n========================================');
console.log('🌐 Your Local IP Address:');
console.log(`   ${ip}`);
console.log('\n📱 To access from your phone:');
console.log(`   http://${ip}:3000`);
console.log('\n🔧 Make sure:');
console.log('   1. Both devices are on the same WiFi network');
console.log('   2. Backend is running: cd backend && python app.py');
console.log('   3. Frontend is running: cd frontend && npm start');
console.log('   4. Windows Firewall allows connections on ports 3000 and 5000');
console.log('========================================\n');






