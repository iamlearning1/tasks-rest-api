const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'your email',
    subject: 'Welcome',
    text: `Welcome to the app, ${name}. Let me know how you get along with the app.`,
  });
};

const sendUserDeleteEmail = (email, name) => {
  sgMail.send({
    to: email,
    form: 'your email',
    subject: 'Sorry to see you go',
    text: `Hi ${name}, Please let me know why you canceled.`,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendUserDeleteEmail,
};
