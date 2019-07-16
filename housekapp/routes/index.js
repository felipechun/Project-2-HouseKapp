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
        .then((group) => {
          console.log(group);
          res.render('dashboard', { user, group });
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
});

router.post('/create/group', (req, res) => {
  const { name, people, creator } = req.body;
  const newGroup = new Group({ name, people: [creator, people] });
  newGroup.save()
    .then((group) => {
      // Faz update do usuário que originou o request para adicioná-lo ao grupo que criou
      User.findByIdAndUpdate({ _id: req.user._id }, { groupName: group.name, groupId: group._id })
        .then((user) => {
          // Convida cada novo usuário para participar do grupo
          for (let i = 1; i < group.people.length; i += 1) {
            inviteUser(user.name, group.people[i], group._id);
          }
          res.redirect('/dashboard');
        })
        .catch(err => console.log(err));
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

  const userId = req.user._id;

  const newTask = new Task({ name, date, value, paidBy: userId });
  newTask.save()
    .then((task) => {
      console.log('NEW TASK', task);
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
  console.log(req.params);
  const { groupId } = req.params;
  const { name, people } = req.body;
  Group.findByIdAndUpdate(groupId, { name, $push: { people } })
    .then(() => {
      res.redirect('/dashboard');
    })
    .catch(err => console.log(err));
});

router.post('/edit/task/:taskId', (req, res) => {
  console.log(req.params);
  const { taskId } = req.params;
  const { name, people } = req.body;
  Task.findByIdAndUpdate(taskId, { name, $push: { people } })
    .then(() => {
      res.redirect('/dashboard');
    })
    .catch(err => console.log(err));
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
