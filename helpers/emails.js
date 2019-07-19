const nodemailer = require('nodemailer');

const inviteUser = (origUser, invited, groupId) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail.com',
    port: 2525,
    auth: {
      user: process.env.GMAIL_ACC,
      pass: process.env.GMAIL_PASS,
    },
  });

  transporter.sendMail({
    from: '"HouseKapp" <no-reply@housekapp.com>',
    to: invited,
    subject: `${origUser} has invited you to his HouseKapp group!`,
    text: `
    Hi, there!

    ${origUser} has invited you to his HouseKapp group!
    
    Please, click on the link below to create your account and start sharing tasks and expenses:
    https://housekapp.herokuapp.com/signup/${groupId}?email=${invited}`,
    html: `
    <h3>Hi, there!</h3>

    <p>${origUser} has invited you to his HouseKapp group!</p>

    <p>Please, click <a href="https://housekapp.herokuapp.com/signup/${groupId}?email=${invited}">here</a> create your account and start sharing tasks and expenses!</p>`,
  });
};

module.exports = inviteUser;
