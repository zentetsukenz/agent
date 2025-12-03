/**
 * Express Application Setup
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');

const endpointsController = require('./features/endpoints/endpoints.controller');
const testsController = require('./features/tests/tests.controller');

const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// Session and flash messages
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
app.use(flash());

// Routes

// Home page
app.get('/', endpointsController.index);

// Endpoints routes
app.get('/endpoints/new', endpointsController.newEndpoint);
app.post('/endpoints', endpointsController.create);
app.get('/endpoints/:id/edit', endpointsController.edit);
app.put('/endpoints/:id', endpointsController.update);
app.delete('/endpoints/:id', endpointsController.destroy);

// Tests routes
app.get('/endpoints/:id/test', testsController.configure);
app.post('/endpoints/:id/test', testsController.execute);
app.get('/tests/:id/results', testsController.results);

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', {
    message: 'Page not found',
    error: { status: 404 }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).render('error', {
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : { status: err.status }
  });
});

module.exports = app;
