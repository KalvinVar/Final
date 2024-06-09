const express = require('express');
const app = express();

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Define the route for the homepage
app.get('/', (req, res) => {
    res.render('index');
});

// Start the server on port 5173
app.listen(5173, () => {
    console.log('Server is running on port 5173');
});
