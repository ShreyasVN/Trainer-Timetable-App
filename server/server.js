const express = require('express');
const path = require('path');
const app = express();

app.use(express.static('public')); // serve script.js and style.css from /public

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(3000, () => console.log('Server started on http://localhost:3000'));
