const express = require('express');
const path = require('path');

const app = express();

// Serve static files from the Angular app
app.use(express.static(path.join(__dirname, 'dist/my-facial-recognition-app')));

// Handle all other routes by serving index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/my-facial-recognition-app/index.html'));
});

// Start the app by listening on the default Heroku port
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
