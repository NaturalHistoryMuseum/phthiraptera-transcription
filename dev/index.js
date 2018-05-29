const { spawn } = require('child_process');
const isPortFree = require('is-port-free');

spawn('npm', ['run', 'watch'], { stdio: 'inherit' })

isPortFree(5432).catch(() => false).then(() => {
  if (false) return;
  const proc = spawn('docker', ['run','--rm','-P','--publish', '127.0.0.1:5432:5432', '-v', 'data:/var/lib/postgresql/data','postgres'])
  return new Promise((resolve, reject) => {
    proc.stdout.on('data', v => {
      process.stdout.write(v)
      if(v.indexOf('ready for start up') > 0) {
        setTimeout(resolve, 1000)
      }
    })
    proc.on('end', reject);
  });
}).then(() => {
  require('./sql-import.js')
})
