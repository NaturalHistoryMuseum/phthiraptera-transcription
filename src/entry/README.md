# Entry files

These are the entry scripts for the build tool.
client.js is loaded in the browser and is responsible for hydrating the html/mounting the app.
server.js is loaded in the server and should return an instance of the Vue app.

createApp is used by both of these scripts to create the root instance of the app.
