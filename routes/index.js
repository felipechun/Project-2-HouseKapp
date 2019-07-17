const express = require('express');
const { ensureLoggedIn } = require('connect-ensure-login');
const uploadCloud = require('../config/cloudinary.js');
const User = require('../models/User');
const Task = require('../models/Task');
const Group = require('../models/Group');
const inviteUser = require('../helpers/emails.js');

const router = express.Router();

router.get('/', (req, res, next) => {
  res.render('index');
});

router.get('/dashboard', ensureLoggedIn(), (req, res) => {
  const { groupId, _id } = req.user;
  Group.findById(groupId)
    .populate('people')
    .then((group) => {
      User.find({ groupId })
        .populate('tasks')
        .then((users) => {
          Task.find({ originGroup: groupId })
            .populate('paidBy whoOwes')
            .then((tasks) => {
              res.render('dashboard', { group, users, tasks });
            })
            .catch(e => console.log(e));
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
});

router.get('/create/group/', (req, res) => {
  User.findById(req.user._id)
    .then((user) => {
      console.log(user);
      res.render('addHome', { user });
    })
    .catch(e => console.log(e));
});

router.post('/create/group', ensureLoggedIn(), (req, res) => {
  const { name, people } = req.body;
  const newGroup = new Group({ name });

  newGroup.save()
    .then((group) => {
      console.log(group);
      console.log(people);
      // Faz update do usuário que originou o request para adicioná-lo ao grupo que criou
      people.map((person) => {
        User.findOneAndUpdate({ username: person }, { groupName: group.name, groupId: group._id })
          .then((user) => {
            if (user === null) {
              inviteUser(req.user.name, person, group._id);
            } else {
              Group.findByIdAndUpdate(newGroup._id, { $push: { people: user._id } })
                .then(() => {
                  res.redirect('/dashboard');
                })
                .catch(err => console.log(err));
            }})
          .catch(e => console.log(e));
      });
    })
    .catch(err => console.log(err));
});

router.get('/create/task', (req, res) => {
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

  const originGroup = req.user.groupId;
  const amountDue = value - amountPaid;

  // whoOwes E paidBy RECEBEM COMO VALUE O GROUP.PEOPLE._ID NO FRONT

  const newTask = new Task({ name, date, value, amountPaid, amountDue, originGroup });

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

router.get('/edit/group/:groupId', (req, res) => {
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
  User.findOne({ username: people })
    .then((user) => {
      Group.findByIdAndUpdate(groupId, { name, $push: { people: user._id } })
        .then(() => {
          res.redirect('/dashboard');
        })
        .catch(err => console.log(err));
    });
});

// Edit tem que atualizar valores, dar check/ adicionar pessoas e concluir
router.get('/edit/task/:taskId', (req, res) => {
  const { taskId } = req.params;
  Task.findById(taskId)
    .populate('whoOwes paidBy')
    .then((task) => {
      // const evenSplit = task.value / (task.whoOwes.length + task.paidBy.length);
      // const roundEvenSplit = evenSplit.toFixed(2);
      res.render('editTask', { task });
    })
    .catch(e => console.log(e));
});

router.post('/edit/task/:taskId', (req, res) => {
  const {
    name,
    date,
    value,
    amountPaid,
    paidBy,
    whoOwes,
  } = req.body;

  let { amountDue } = req.body;

  // muda status de pagamento
  const paymentStatusPromise = Task.findById(req.params.taskId)
    // .populate('paidBy whoOwes')
    .then((task) => {
      const owes = [];
      task.whoOwes.map(user => owes.push(user));

      // req.body.paidBy tem que me dar um id

      if (task.whoOwes.indexOf(req.body.paidBy) !== -1) {
        if (amountDue) {
          amountDue -= amountPaid;
        }

        Task.findByIdAndUpdate(task._id, { $push: { paidBy: req.body.paidBy }, $pull: { whoOwes: req.body.paidBy }, amountDue })
          .then((tk) => {
            if (tk.whoOwes.length === 1) {
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
    // .populate('paidBy whoOwes')
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

// editar tarefas / completar tarefas
// const {
//   name,
//   date,
//   value,
//   paidBy,
//   whoOwes,
// } = req.body;

module.exports = router;
