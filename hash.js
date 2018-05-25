const bcrypt = require('bcrypt');

const saltRounds = 10;

if (process.argv.length !== 3) {
  throw new Error('Supply exactly one argument: password to hash');
}

const pw = process.argv[2];

bcrypt.hash(pw, saltRounds, (err, hash) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log(hash);
})