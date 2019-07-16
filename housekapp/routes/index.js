const express = require('express');
const router  = express.Router();
const { ensureLoggedIn } = require('connect-ensure-login');
const uploadCloud = require('../config/cloudinary.js');
const User = require('../models/User');
const Post = require('../models/Task');

/* GET home page */
router.get('/', (req, res, next) => {
  res.render('index');
});

// GET Dashboard page
router.get('/dashboard', (req, res, next) => {
  res.render('dashboard');
});

// GET add home page
router.get('/add-home', (req, res, next) => {
  res.render('addhome');
});

// GET invite signup page
router.get('/invite-signup', (req, res, next) => {
  res.render('./auth/invite-signup');
});

// GET verification page
router.get('/verification', (req, res, next) => {
  res.render('verification');
});

module.exports = router;
