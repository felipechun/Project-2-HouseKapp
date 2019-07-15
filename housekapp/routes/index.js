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

module.exports = router;
