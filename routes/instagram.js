var Router = require('express').Router
var Instagram = require('node-instagram').default

var instagramRoute = Router()
var route = Router()

var credentials = {
    clientId : '5c8cc205548a4dca8bde29e278b36933',
    clientSecret : '112a0875ab1847a2bcb52d3e20b1300d',
    // accessToken : '284695713.1677ed0.591e340d68c64f2284541e3cfc796355',
    accessToken : '284695713.5c8cc20.f3a18f1675b64f9bb0d3161d4cd46bd9',
    // accessToken : '96ba0491ff41476da810f1f4a7d1347e'
}

var instagram = new Instagram(credentials)

instagramRoute.get('/photos/:tag?', function(req, res) {
    var tag = req.params.tag || 'EndedUpAtJYD'

    instagram.get('tags/' + tag + '/media/recent')
    .then(function(data) {
        return res.send({ data : data.data.slice(0,4) })
    })
    .catch(function(err) {
        console.log(err)
        return res.send({ data : null })
    })
})

// function getFeed(cb, tag) {
//     var tags = tag || 'EndedUpAtJYD'

//     instagram.get('tags/' + tags + '/media/recent')
//         .then(function(data) {
//             return cb(null, data)
//         })
//         .catch(function(err) {
//             return cb(err)
//         })
// }

route.use('/instagram', instagramRoute)

module.exports = route
