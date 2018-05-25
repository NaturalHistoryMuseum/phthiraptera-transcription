const express = require('express');

const app = express();

app.get('/', (req, res) => {
    res.send('Hello');
});

app.use((req, res) => {
    res.status(404).send('File not found');
});

app.listen(process.env.PORT || 1234);