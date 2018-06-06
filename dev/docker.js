const { spawn } = require('child_process');
const isPortFree = require('is-port-free');

const checkPort = () => isPortFree(5432).then(() => true, () => false);

const start = async () => {
  if (!await checkPort()) {
    return;
  }

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
};

module.exports = start;

if(require.main === module) {
  start();
}
