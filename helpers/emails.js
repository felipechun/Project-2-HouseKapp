const nodemailer = require('nodemailer');

const inviteUser = (origUser, invited, groupId) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
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
    http://localhost:3000/signup/${groupId}?email=${invited}`,
    html: `
    <h3>Hi, there!</h3>

    <p>${origUser} has invited you to his HouseKapp group!</p>

    <p>Please, click <a href="http://localhost:3000/signup/${groupId}?email=${invited}">here</a> create your account and start sharing tasks and expenses!</p>`,
  });
};

module.exports = inviteUser;
