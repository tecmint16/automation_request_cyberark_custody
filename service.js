import nodeWindows from 'node-windows';

// Create a new service object
let svc = new nodeWindows({
  name: 'Custody Request CyberArk',
  description: 'This is Request CyberArk service',
  script: 'D:\\Tecmint\\Automation\\automation_request_cyberark_custody\\index.js', // lokasi script Node.js
  nodeOptions: [
    '--harmony',
    '--max_old_space_size=4096'
  ]
});

// When the service is installed
svc.on('install', () => {
  console.log('Service installed');
  svc.start(); // otomatis start setelah install
});

svc.install();