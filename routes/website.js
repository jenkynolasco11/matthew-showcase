var Router = require('express').Router
var sendEmail = require('../mailer').sendEmail
var path = require('path')

var route = Router()
var web = Router()

function stripData(data) {
    var name = ''
    var emailData = {}

    if(!data.email) return null

    if(data["First Name"] && data["Last Name"])
        name = data["First Name"] + ' ' + data["Last Name"]
    else if
        (data.name) name = data.name

    emailData.from = `"${ name }" <${ data.email }>`
    emailData.to = 'info@jydautoleasing.com'
    emailData.bcc = 'jenky@leadfire.com'
    emailData.subject = data.type + ' - ' + name
    emailData.text = JSON.stringify(data, null, 2).replace(/["{},]/g,'')

    // emailData.to = 'angelo@jydautoleasing.com, office@jydautoleasing.com,info@jydautoleasing.com'
    // emailData.to = 'jenky@leadfire.com,info@jydautoleasing.com',
    // emailData.cc = 'jenky@leadfire.com',
    // emailData.to = 'jenky@leadfire.com'
    // delete data["First Name"]
    // delete data["Last Name"]
    // delete data.name
    // delete data.email
    delete data.type

    return emailData
}

route.post('/data', function(req, res) {
    var body = req.body
    var emailData = stripData(body)

    if(!emailData) return res.send('ok')

    sendEmail(emailData, function(err, c) {
        if(err) return console.log(err)
        console.log('Email sent!')
    })

    return res.send('ok')
})

route.get('/', function(req, res){
    console.log(__dirname)
    res.sendFile(path.resolve('static/index.html'))
})

web.use('/', route)

module.exports = web
