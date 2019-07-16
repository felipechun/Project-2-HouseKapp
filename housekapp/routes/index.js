const express = require('express');
const { ensureLoggedIn } = require('connect-ensure-login');
const uploadCloud = require('../config/cloudinary.js');
const User = require('../models/User');
const Task = require('../models/Task');
const Group = require('../models/Group');
const inviteUser = require('../helpers/emails.js');

const router = express.Router();

/* GET home page */
router.get('/', (req, res, next) => {
  res.render('index');
});

router.get('/dashboard', ensureLoggedIn(), (req, res) => {
  const { groupId, _id } = req.user;
  User.findById(_id)
    .then((user) => {
      Group.find({ _id: groupId })
        .populate('people', 'name')
        .then((group) => {
          res.render('dashboard', { user, group });
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
});

router.get('/create/group/', (req, res) => {
  res.render('createGroup');
});

router.post('/create/group', ensureLoggedIn(), (req, res) => {
  const { name, people } = req.body;
  const newGroup = new Group({ name });

  newGroup.save()
    .then((group) => {
      // console.log(newGroup);
      // Faz update do usuário que originou o request para adicioná-lo ao grupo que criou
      people.map((person) => {
        User.findOneAndUpdate({ username: person }, { groupName: group.name, groupId: group._id })
          .then((user) => {
            // manda invites
            for (let i = 1; i < people.length; i += 1) {
              if (user === null) {
                inviteUser(req.user.name, person, group._id);
              } else {
                Group.findByIdAndUpdate(newGroup._id, { $push: { people: user._id } });
              }
            }
            Group.findByIdAndUpdate(newGroup._id, { $push: { people: req.user._id} })
            res.redirect('/dashboard');
          })
          .catch(e => console.log(e));
      });
    })
    .catch(err => console.log(err));
});

router.post('/create/task', (req, res) => {
  const {
    name,
    date,
    value,
    whoOwes,
  } = req.body;

  // Falta adicionar whoOwes

  const userId = req.user._id;

  const newTask = new Task({ name, date, value, paidBy: userId });
  newTask.save()
    .then((task) => {
      if (task.value <= 0) {
        User.findByIdAndUpdate({ _id: req.user._id },
          { $push: { tasks: newTask._id } })
          .then((user) => {
            res.redirect('/dashboard');
          })
          .catch(err => console.log(err));
      } else {
        User.findByIdAndUpdate({ _id: req.user._id },
          { $push: { expenses: newTask._id } })
          .then((user) => {
            res.redirect('/dashboard');
          })
          .catch(err => console.log(err));
      }
    })
    .catch(err => console.log(err));
});

router.get('/edit/group/:groupId', (req, res) => {
  const { groupId } = req.params;
  res.render('editGroup', { groupId });
});

router.post('/edit/group/:groupId', (req, res) => {
  const { groupId } = req.params;
  const { name, people } = req.body;
  Group.findByIdAndUpdate(groupId, { name, $push: { people } })
    .then(() => {
      res.redirect('/dashboard');
    })
    .catch(err => console.log(err));
});

// Edit tem que atualizar valores, dar check/ adicionar pessoas e concluir
router.get('/edit/task/:taskId', (req, res) => {
  const { taskId } = req.params;
  const { name, paidBy, whoOwes } = req.body;
  Task.findById(taskId)
    .populate('whoOwes', 'name')
    .populate('paidBy', 'name')
    .then((task) => {
      res.render('editTask', { task });
    })
    .catch(e => console.log(e));

  // Task.findByIdAndUpdate(taskId, { name, $push: { people } })
  //   .then(() => {
  //     res.redirect('/dashboard');
  //   })
  //   .catch(err => console.log(err));
});

// editar tarefas / completar tarefas
// const {
//   name,
//   date,
//   value,
//   paidBy,
//   whoOwes,
// } = req.body;

module.exports = router;
