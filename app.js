'use strict';

var body = require('body-parser');
var nodemailer = require('nodemailer');
var express = require('express');

var sendEmail = require('./mailer').sendEmail

var app = express();

app.use(body.urlencoded({ extended : true }))
app.use('', express.static('./static'));

// Render the main view
app.get('/', function(req, res){
  res.sendFile(__dirname + '/static/index.html');
});

app.post('/data', function(req, res) {
  console.log(req.body)
  var body = req.body

  if(body.firstname && body.lastname) body.name = body.firstname + ' ' + body.lastname

  if(!body.name || !body.email) {

    return res.send('ok')
  }

  var emailData = {}

  emailData.from = `${ body.name } <${ body.email }>`
  // emailData.to = 'angelo@jydautoleasing.com, office@jydautoleasing.com,info@jydautoleasing.com'
  emailData.to = 'jenky_nolasco@hotmail.com, jenky.nolasco@gmail.com'
  emailData.subject = 'Testing'
  emailData.text = JSON.stringify(body, null, 3)

  sendEmail(emailData, function(err, c) {
    if(err) console.log(err)

    console.log('Email sent!')
  })

  return res.send('ok')
})

app.listen(process.env.PORT || 8080);
console.log('Listening on port ' + (process.env.PORT || 8080) + '...');