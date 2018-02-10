var Router = require('express').Router
var multer = require('multer')
var path = require('path')

var route = Router()
var admin = Router()

var upload = multer({ dest : '../img-uploads' })

route.get('/', function(req, res) {
    res.sendFile(path.resolve('static/admin.html'))
})

route.post('/upload-car', upload.single('car-image'), function(req, res) {
    var file = req.file
    var body = req.body
})

admin.use('/admin', route)

module.exports = admin
