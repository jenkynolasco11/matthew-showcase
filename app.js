'use strict';

var express = require('express');
var app = express();

// configure static files
// var paths = ['static'];
app.use('', express.static('./static'));
// paths.forEach(function(path){
//   app.use('/' + path, express.static('./' + path));
// });

// configure routes

// var initPassport = require('./passport-init');
// initPassport(passport);

// Configure view settings
// app.set('views', paths.concat('static').map(path => './' + path));

// set routes

// Render the main view
app.get('/', function(req, res){
  res.sendFile(__dirname + '/static/index.html');
});


// Views renderer
// app.get('/views/:viewpath(*)', function (req, res){
//   var viewpath = req.params.viewpath;

//   // console.log(viewpath);
//   res.render(viewpath);
// });

// Handle Errors
// app.use(errors);

app.listen(process.env.PORT || 8080);
console.log('Listening on port ' + (process.env.PORT || 8080) + '...');