const express = require('express');
const auth = require('./auth');

const app = express();

app.use(auth);

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.use((req, res) => {
    res.status(404).send('File not found');
});

app.listen(process.env.PORT || 1234);