var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var errorHandler = require('errorhandler');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// Configuration
var connection = mysql.createConnection({
  host     : 'localhost',
  port : 3306,
  user     : 'root',
  password : 'root',
  database:'express_mysql_mvc_dev'
});

connection.connect(function(err) {
    if (err) {
        console.error('mysql connection error');
        console.error(err);
        throw err;
    }
});

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, '../frontend/app')));
if (app.get('env') === 'development') {
    app.use(express.static(path.join(__dirname, '../frontend/app')));
    app.use(errorHandler({ dumpExceptions: true, showStack: true }));
} else {
  // production
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.use(errorHandler());
};

routes(app);

// app.use('/', function(req, res, next) {
//   //res.render('index', { title: 'Express' });
//   res.sendfile('../frontend/app/index.html');
// });

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.send('Error '+ err.stacktrace);
    });
} 

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send('Error '+ err.stacktrace);
});


module.exports = app;
