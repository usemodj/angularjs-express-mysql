var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var passport = require('passport');
var errorHandler = require('errorhandler');

var models = require('./models/');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// Configuration

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(methodOverride());
app.use(cookieParser());
app.use(session({
	secret : 'your secret here',
	key : 'sid',
	cookie : {
		secure : true
	}
}));
// app.use(express.static(path.join(__dirname, '../frontend/app')));
if (app.get('env') === 'development') {
	app.use(express.static(path.join(__dirname, '../frontend/app')));
	app.use(errorHandler({
		dumpExceptions : true,
		showStack : true
	}));
} else {
	// production
	app.use(express.static(path.join(__dirname, '../frontend/dist')));
	app.use(errorHandler());
};
app.use(passport.initialize());
app.use(passport.session());

// DB Models
app.use(function(req, res, next) {
	models(function(err, db) {
		if (err)
			return next(err);

		req.models = db.models;
		req.db = db;

		return next();
	});
});

//Routes
routes(app);
users(app);


// Catch 404 and forwarding to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.send('Error ' + err.stacktrace);
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.send('Error ' + err.stacktrace);
});

module.exports = app;
