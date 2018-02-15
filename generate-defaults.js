var models = require('./models')
var Meta = models.Meta
var User = models.User

// create new Meta
Meta.findOne({}, function(err, meta) {
    if(meta) return

    return new Meta({ lastCarId : 1 }).save(function(err,doc){ })
})

// create default user
User.findOne({ username : 'jydauto' }, function(err, user) {
    if(user) return

    var usr = new User({ username : 'jydauto' })
    usr.password = usr.generateHash('jydautoleasing123')

    return usr.save()
})
