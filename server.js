// server.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const db = require('./database');
const bcrypt = require('bcryptjs');

const app = express();
const port = 3000;

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Serve static files from the /assets, /css, and /js folders
app.use(express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname, 'css')));
app.use(express.static(path.join(__dirname, 'js')));

// Middleware to parse incoming requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Render home page (index.html) for buyers
app.get('/', (req, res) => {
    res.render('homepage');  // Using 'homepage.ejs' from the templates/buyer folder
});

// Serve login and signup pages
app.get('/login', (req, res) => {
    res.render('login');  // Using 'login.ejs' from the templates folder
});

app.get('/signup', (req, res) => {
    res.render('signup');  // Using 'signup.ejs' from the templates folder
});

// Serve seller-specific pages (ensure authentication for sellers)
app.get('/seller/dashboard', (req, res) => {
    res.render('seller/seller-dashboard');
});

app.get('/seller/product-upload', (req, res) => {
    res.render('seller/product-upload');
});

// Post routes for signup and login
app.post('/signup', (req, res) => {
    const { name, email, password } = req.body;

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ error: 'Error hashing password' });
        }

        const stmt = db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
        stmt.run(name, email, hashedPassword, function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error inserting user into database' });
            }
            res.status(200).json({ message: 'User registered successfully' });
        });
        stmt.finalize();
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Error querying database' });
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ error: 'Error comparing passwords' });
            }

            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            res.status(200).json({ message: 'Login successful' });
        });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});