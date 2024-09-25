const express = require('express');
const { create } = require('express-handlebars');
const os = require("os");
const morgan = require('morgan');

const app = express();

// Set up Handlebars engine with default layout
const hbs = create({ defaultLayout: 'main' });
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Middleware
app.use(express.static('static'));
app.use(morgan('combined'));

// Configuration
const port = process.env.PORT || 8080;
const message = process.env.MESSAGE || "Hello Azure Arc GitOps Demo!";

// Routes
app.get('/', (req, res) => {
    res.render('home', {
        message,
        platform: os.type(),
        release: os.release(),
        hostName: os.hostname()
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Listening on: http://${os.hostname()}:${port}`);
});