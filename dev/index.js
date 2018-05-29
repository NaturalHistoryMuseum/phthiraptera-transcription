const { spawn } = require('child_process');
const isPortFree = require('is-port-free');

spawn('npm', ['run', 'watch'], { stdio: 'inherit' })

isPortFree(5432).catch(() => false).then((free) => {
  if (!free) return;

  const proc = spawn('docker', ['run','--rm','-P','--publish', '127.0.0.1:5432:5432', '-v', 'data:/var/lib/postgresql/data','postgres'])
  return new Promise((resolve, reject) => {
    // stderr => log messages; already setup
    proc.stderr.on('data', v => {
      process.stderr.write(v);

      if(v.indexOf('ready to accept connections') >= 0) {
        resolve();
      }
    })

    // stdout => first run
    let initComplete = false;
    proc.stdout.on('data', v => {
      process.stdout.write(v)

      if(v.indexOf('init process complete') >= 0) {
        initComplete = true;
      }

      if(initComplete && v.indexOf('ready to accept connections') >= 0) {
        resolve()
      }
    })
    proc.on('end', reject);
  });
}).then(() => {
  require('./sql-import.js')
}).catch(e => {
  console.log(e);
  process.exit(1);
})
