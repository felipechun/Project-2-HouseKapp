/* eslint-disable no-underscore-dangle */
const express = require('express');
const { ensureLoggedIn } = require('connect-ensure-login');
const User = require('../models/User');
const Task = require('../models/Task');
const Group = require('../models/Group');
const inviteUser = require('../helpers/emails.js');

const router = express.Router();

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/dashboard', ensureLoggedIn('/'), (req, res) => {
  if (!req.user.groupId) {
    const { user } = req;
    res.render('addhome', { user });
  } else {
    const { groupId } = req.user;
    const loggedUser = req.user;
    console.log(loggedUser);
    Group.findById(groupId)
      .populate('people')
      .then((group) => {
        User.find({ groupId })
          .populate('tasks')
          .then((users) => {
            Task.find({ originGroup: groupId })
              .populate('paidBy whoOwes')
              .then((tasks) => {
                Task.findOneAndUpdate({ amountDue: { $lt: 0 }}, { $set: { amountDue: 0 }})
                  .then(() => res.render('dashboard', { group, users, tasks, loggedUser }))
                  .catch(e => console.log(e));
              })
              .catch(e => console.log(e));
          })
          .catch(err => console.log(err));
      })
      .catch(err => console.log(err));
  }
});

router.get('/create/group/', ensureLoggedIn('/'), (req, res) => {
  User.findById(req.user._id)
    .then((user) => {
      if (user.groupId) {
        res.redirect('/dashboard');
      } else {
        res.render('addHome', { user });
      }
    })
    .catch(e => console.log(e));
});

router.post('/create/group', ensureLoggedIn('/'), (req, res) => {
  const { name, people } = req.body;
  const newGroup = new Group({ name });

  if (typeof people !== 'object') {
    newGroup.save()
      .then((group) => {
        User.findOneAndUpdate({ username: people }, { groupId: group._id })
          .then((user) => {
            if (user === null) {
              inviteUser(req.user.name, people, group._id);
              res.redirect('/dashboard');
            } else {
              Group.findByIdAndUpdate(newGroup._id, { $push: { people: user._id } })
                .then(() => {
                  res.redirect('/dashboard');
                })
                .catch(err => console.log(err));
            } })
          .catch(e => console.log(e));
      });
  } else {
    newGroup.save()
      .then((group) => {
        // Faz update do usuário que originou o request para adicioná-lo ao grupo que criou
        people.map((person) => {
          User.findOneAndUpdate({ username: person }, { groupId: group._id })
            .then((user) => {
              if (user === null) {
                inviteUser(req.user.name, person, group._id);
                res.redirect('/dashboard');
              } else {
                Group.findByIdAndUpdate(newGroup._id, { $push: { people: user._id } })
                  .then(() => {
                    res.redirect('/dashboard');
                  })
                  .catch(err => console.log(err));
              } })
            .catch(e => console.log(e));
        });
      })
      .catch(err => console.log(err));
  }
});

router.get('/create/task', ensureLoggedIn('/'), (req, res) => {
  Group.findById(req.user.groupId)
    .populate('people')
    .then((group) => {
      res.render('addTask', { group });
    })
    .catch(err => console.log(err));
});

router.post('/create/task', (req, res) => {
  const {
    name,
    date,
    value,
    amountPaid,
    paidBy,
    whoOwes,
  } = req.body;

  let newTask = {};

  const originGroup = req.user.groupId;
  if (amountPaid > 0) {
    const amountDue = value - amountPaid;
    newTask = new Task({ name, date, value, amountPaid, amountDue, originGroup, completed: false });
  } else {
    newTask = new Task({ name, date, value, amountPaid, originGroup, completed: false });
  }

  if (amountPaid === value && value > 0) {
    newTask.completed = true;
  } else {
    newTask.completed = false;
  }

  newTask.save()
    .then((task) => {
      const pr1 = (typeof paidBy) === 'object'
        ? paidBy.map((payer) => {
          Task.findByIdAndUpdate(newTask._id, { $push: { paidBy: payer } })
            .then(() => {
              User.findByIdAndUpdate(payer, { $push: { tasks: task._id } })
                .then(x => x)
                .catch(e => console.log(e));
            })
            .catch((e) => console.log(e));
        })
        : Task.findByIdAndUpdate(newTask._id, { $push: { paidBy } })
          .then((payer) => {
            User.findByIdAndUpdate(paidBy, { $push: { tasks: task._id } })
              .then(x => x)
              .catch(e => console.log(e));
          })
          .catch(e => console.log(e));

      const pr2 = (typeof whoOwes === 'object')
        ? whoOwes.map((owes) => {
          Task.findByIdAndUpdate(newTask._id, { $push: { whoOwes: owes }})
            .then(() => {
              User.findByIdAndUpdate(owes, { $push: { tasks: task._id } })
                .then(x => x)
                .catch(e => console.log(e));
            })
            .catch((e) => console.log(e));
        })
        : Task.findByIdAndUpdate(newTask._id, { $push: { whoOwes }})
          .then((owes) => {
            User.findByIdAndUpdate(whoOwes, { $push: { tasks: task._id } })
              .then(x => x)
              .catch(e => console.log(e));
          })
          .catch(e => console.log(e));


      Promise.all([pr1, pr2])
        .then(() => {
          res.redirect('/dashboard');
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
});

router.get('/edit/group/:groupId', ensureLoggedIn('/'), (req, res) => {
  const { groupId } = req.params;
  Group.findById(groupId)
    .populate('people')
    .then((group) => {
      res.render('editGroup', { group });
    })
    .catch(e => console.log(e));
});

router.post('/edit/group/:groupId', (req, res) => {
  const { groupId } = req.params;
  const { name, people } = req.body;

  if (!people) {
    console.log(groupId);
    Group.findByIdAndUpdate(groupId, { name })
      .then(() => {
        res.redirect('/dashboard');
      })
      .catch(e => console.log(e));
  } else {
    const promise1 = (typeof people === 'object')
      ? Group.findOne({ groupId })
        .then((group) => {
          people.map((person) => {
            User.findOneAndUpdate({ username: person }, { groupId })
              .then((user) => {
                if (user === null) {
                  inviteUser(req.user.name, person, groupId);
                } else {
                  Group.findByIdAndUpdate(groupId, { $push: { people: user._id }, name })
                    .then(x => x)
                    .catch(err => console.log(err));
                }})
              .catch(e => console.log(e));
          });
        })
        .catch(err => console.log(err))
      : Group.findOne({ groupId })
        .then((group) => {
          User.findOneAndUpdate({ username: people }, { groupId })
            .then((user) => {
              if (user === null) {
                inviteUser(req.user.name, people, groupId);
              } else {
                Group.findByIdAndUpdate(groupId, { $push: { people: user._id }, name })
                  .then(x => x)
                  .catch(err => console.log(err));
              }})
            .catch(e => console.log(e));
        })
        .catch(e => console.log(e));

    Promise.all([promise1])
      .then(() => res.redirect('/dashboard'))
      .catch(error => console.log(error));
  }
});

router.get('/edit/task/:taskId', ensureLoggedIn('/'), (req, res) => {
  const { taskId } = req.params;
  Task.findById(taskId)
    .populate('whoOwes paidBy')
    .then((task) => {
      res.render('editTask', { task });
    })
    .catch(e => console.log(e));
});

router.post('/edit/task/:taskId', (req, res) => {
  let {
    name,
    date,
    amountPaid,
    paidBy,
    whoOwes,
  } = req.body;

  // muda status de pagamento
  const paymentStatusPromise = Task.findById(req.params.taskId)
    .then((task) => {
      const owes = [];
      let { amountDue } = task;
      let accAmountPaid = task.amountPaid;

      task.whoOwes.map(user => owes.push(user));

      // tratar o retorno do input
      amountPaid = parseFloat(amountPaid);

      // req.body.paidBy tem que me dar um id

      if (task.whoOwes.indexOf(req.body.paidBy) !== -1) {
        if (amountDue) {
          amountDue -= amountPaid;
          accAmountPaid += amountPaid;
        }

        Task.findByIdAndUpdate(task._id,
          {
            $push: { paidBy: req.body.paidBy },
            $pull: { whoOwes: req.body.paidBy },
            amountDue,
            amountPaid: accAmountPaid,
          })
          .then((tk) => {
            if (tk.whoOwes.length <= 1 || accAmountPaid >= task.value || amountDue <= 0) {
              Task.findByIdAndUpdate(task._id, { completed: true })
                .then(f => f)
                .catch(e => console.log(e));
            }
          })
          .catch(e => console.log(e));
      }
    })
    .catch(err => console.log(err));

  // muda nome e data
  const nameDatePromise = Task.findById(req.params.taskId)
    .then((task) => {
      Task.findByIdAndUpdate(task._id, { name, date })
        .then(x => x)
        .catch(e => console.log(e));
    })
    .catch(err => console.log(err));

  Promise.all([paymentStatusPromise, nameDatePromise])
    .then(() => {
      res.redirect('/dashboard');
    })
    .catch(err => console.log(err));
});

router.post('/edit/task/renamereassign/:taskId/', (req, res) => {
  const { taskId } = req.params;
  const { date, name, paidBy } = req.body;

  Task.findById(taskId)
    .then((task) => {
      const originalPayer = task.paidBy;
      User.findByIdAndUpdate(originalPayer, { $pull: { tasks: taskId } })
        .then(() => {
          Task.findByIdAndUpdate(taskId, { date, name, $set: { paidBy:paidBy } })
            .then(() => {
              User.findByIdAndUpdate(paidBy, { $push: { tasks: taskId } })
                .then(() => res.redirect('/dashboard'))
                .catch(e => console.log(e));
            })
            .catch(e => console.log(e));
        })
        .catch(e => console.log(e));
    })
    .catch(e => console.log(e));
});

router.post('/edit/completetask/:taskId', (req, res) => {
  const { taskId } = req.params;

  Task.findByIdAndUpdate(taskId, { completed: true })
    .then(() => res.redirect('/dashboard'))
    .catch(err => console.log(err));
});

// Deletes
router.post('/delete/task/:taskId', ensureLoggedIn('/'), (req, res) => {
  const { taskId } = req.params;
  Task.findByIdAndDelete(taskId)
    .then((task) => {
      res.redirect('/dashboard');
    })
    .catch(e => console.log(e));
});

router.post('/delete/group/:groupId', ensureLoggedIn('/'), (req, res) => {
  const { groupId } = req.params;
  User.findOneAndUpdate({ groupId }, { groupId: null })
    .then(() => {
      Group.findByIdAndDelete(groupId)
        .then(() => res.redirect('/create/group'))
        .catch(e => console.log(e));
    })
    .catch(e => console.log(e));
});

router.post('/delete/userfromgroup/', ensureLoggedIn('/'), (req, res) => {
  const { email } = req.body;
  User.findOneAndUpdate({ username: email }, { groupId: null })
    .then((user) => {
      console.log(user);
      Group.findByIdAndUpdate(req.user.groupId, { $pull: { people: user._id } })
        .then(() => res.redirect('/create/group'))
        .catch(e => console.log(e));
    })
    .catch(e => console.log(e));
});

router.post('/delete/user/:userId', ensureLoggedIn('/'), (req, res) => {
  const { userId } = req.user._id;
  Group.findOneAndUpdate({ people: userId }, { $pull: { people: userId } })
    .then(() => {
      User.findByIdAndDelete(userId)
        .then(() => {
          req.logout();
          res.redirect('/');
        })
        .catch(e => console.log(e));
    })
    .catch(e => console.log(e));
});

module.exports = router;
