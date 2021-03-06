const express    = require('express');
const passport   = require('passport');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const router     = express.Router();
const { ensureLoggedIn, ensureLoggedOut } = require('connect-ensure-login');
const User = require('../models/User');
const Group = require('../models/Group');
const uploadCloud = require('../config/cloudinary');

// Signup novo membro
router.get('/signup', ensureLoggedOut(), (req, res) => {
  res.render('auth/signup');
});

// Signup membro convidado
router.get('/signup/:groupId', ensureLoggedOut(), (req, res) => {
  const { groupId } = req.params;
  const { email } = req.query;
  res.render('auth/invite-signup', { groupId, email });
});

// Signup novo membro
router.post('/signup', ensureLoggedOut(), uploadCloud.single('avatar'), (req, res) => {
  const { username, name, password, confirmPassword } = req.body;

  let imgPath = 'images/default-profile.png';
  let imgName = 'no_image';

  if (req.file !== undefined) {
    imgPath = req.file.secure_url;
    imgName = req.file.originalname;
  }

  // Check validity
  if (username === '' || password === '') {
    res.render('auth/signup', { message: 'Indicate email and password' });
    return;
  }

  if (password !== confirmPassword) {
    res.render('auth/signup', { message: 'Passwords don\'t match' });
    return;
  }

  User.findOne({ username }, 'email', (err, user) => {
    if (user !== null) {
      res.render('auth/signup', { message: 'This email is already in use' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const hashPass = bcrypt.hashSync(password, salt);

    const tokenFunc = () => {
      const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let token = '';
      for (let i = 0; i < 25; i += 1) {
        token += characters[Math.floor(Math.random() * characters.length)];
      }
      return token;
    };

    const authToken = tokenFunc();

    const newUser = new User({
      name,
      password: hashPass,
      username,
      confirmationCode: authToken,
      imgPath,
      imgName,
    });

    newUser.save()
      .then(() => {
        res.redirect('/');
      })
      .catch((e) => {
        console.log(e);
        res.render('auth/signup', { message: 'Something went wrong' });
      });
  });
});

// Signup membro convidado
router.post('/signup/:groupId', ensureLoggedOut(), uploadCloud.single('avatar'), (req, res) => {
  const { username, name, password, confirmPassword, groupId } = req.body;

  let imgPath = 'images/default-profile.png';
  let imgName = 'no_image';

  if (req.file !== undefined) {
    imgPath = req.file.secure_url;
    imgName = req.file.originalname;
  }

  // Check validity
  if (username === '' || password === '') {
    res.render('auth/invite-signup', { message: 'Indicate username and password' });
    return;
  }

  if (password !== confirmPassword) {
    res.render('auth/invite-signup', { message: 'Passwords don\'t match' });
    return;
  }

  User.findOne({ username }, 'email', (err, user) => {
    if (user !== null) {
      res.render('auth/invite-signup', { message: 'This email is already in use' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const hashPass = bcrypt.hashSync(password, salt);

    const tokenFunc = () => {
      const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let token = '';
      for (let i = 0; i < 25; i += 1) {
        token += characters[Math.floor(Math.random() * characters.length)];
      }
      return token;
    };

    const authToken = tokenFunc();
    let groupName = '';

    Group.findById(groupId)
      .then((group) => {
        groupName = group.name;
        const newUser = new User({
          name,
          password: hashPass,
          username,
          confirmationCode: authToken,
          imgPath,
          imgName,
          groupId,
        });
    
        newUser.save()
          .then((usr) => {
            console.log(usr);
            Group.findByIdAndUpdate(groupId, { $push: { people: usr._id } })
              .then((grp) => {
                console.log(grp);
                res.redirect('/');
              })
              .catch(x => console.log(x));
          })
          .catch((e) => {
            console.log(e);
            res.render('auth/invite-signup', { message: 'Something went wrong' });
          });
      })
      .catch(error => console.log(error));
  });
});


router.post('/login', passport.authenticate('local', {
  successReturnToOrRedirect: '/dashboard',
  failureRedirect: '/',
  passReqToCallback: true,
}));

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// Social Login - GOOGLE

router.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
  }),
);
router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/dashboard',
    failureRedirect: '/', // here you would redirect to the login page using traditional login approach
  }),
);

// Criar rota de verificação de email (EXTRA)

module.exports = router;
