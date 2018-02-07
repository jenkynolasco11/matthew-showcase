const nodemailer = require('nodemailer')
const mailConfig = require('./mailConfig').keys;

const transporter = nodemailer.createTransport({
  service : 'gmail',
  auth : mailConfig.oauth
});

const sendEmail = exports.sendEmail = (mailOptions, callback) => {
  if(!mailOptions.to || !mailOptions.text)
    return callback('Error on options.', new Error('Error: No text or sender email has been added to options sent.'));

  if(!mailOptions.from)
    mailOptions.from = 'default <admin@jydautoleasing.com>'; // change this to default email

  if(!mailOptions.subject)
    mailOptions.subject = 'Do not reply - JYD Auto Leasing'; // change this to default subject

  const verifyMail = (err,success) => {
    if(err) return callback('Error verifying connection to SMTP server', err);

    const send = (err, res) => {
      if(err) return callback('Error', err);  //
      return callback(null, res);
    };

    transporter.sendMail(mailOptions, send);
  };

  transporter.verify(verifyMail);
};