# Phthiraptera Transcriptions

Requires nodejs and, for development, docker.

Install with `npm install`.

In production, build with `npm run heroku-postinstall`.

Start with `npm start` (in dev this runs the build too and sets up the).

To change the password:

 - Run `npm run hash [new password]`
 - Set the output as the `PW_HASH` env var.
