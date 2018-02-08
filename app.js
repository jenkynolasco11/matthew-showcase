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

function stripData(data) {
  console.log(data)
  var name = ''

  var name = ''

  if(data["First Name"] && data["Last Name"]) name = data["First Name"] + ' ' + data["Last Name"]
  else if (data.name) name = data.name

  if(!data.email) return null

  var emailData = {}

  emailData.from = `"${ name }" <${ data.email }>`
  // emailData.to = 'angelo@jydautoleasing.com, office@jydautoleasing.com,info@jydautoleasing.com'
  emailData.to = 'info@jydautoleasing.com',
  // emailData.to = 'jenky@leadfire.com,info@jydautoleasing.com',
  // emailData.bcc = 'jenky@leadfire.com',
  emailData.cc = 'jenky@leadfire.com',
  // emailData.to = 'jenky@leadfire.com'
  emailData.subject = data.type + ' - ' + name

  // delete data["First Name"]
  // delete data["Last Name"]
  delete data.name
  delete data.type
  // delete data.email

  emailData.text = JSON.stringify(data, null, 2).replace(/["{},]/g,'')

  return emailData
}

app.post('/data', function(req, res) {
  // console.log(req.body)
  var body = req.body

  var emailData = stripData(body)

  if(!emailData) return res.send('ok')

  console.log(emailData)

  sendEmail(emailData, function(err, c) {
    if(err) return console.log(err)

    console.log('Email sent!')
  })

  return res.send('ok')
})

app.listen(process.env.PORT || 8080);
console.log('Listening on port ' + (process.env.PORT || 8080) + '...');
