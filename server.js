const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; // Use Heroku's port or default to 3000

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
