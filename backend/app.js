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
var fs = require('fs');
var SessionStore = require('express-mysql-session');
var modRewrite = require('connect-modrewrite');
var multipart = require('connect-multiparty');

var settings = require('./config/settings');
var models = require('./models/index');//index.js
var mailer = require('./config/mailer');
var log4js = require('log4js');

//var log = log4js.getLogger("app");
var app = express();

//Passport-local Strategy and  DB Models
app.use(function(req, res, next) {
    models(function(err, db) {
        if (err)
            return next(err);
        //database
        req.models = db.models;
        req.db = db;
        //passport-local strategy
        require('./config/pass')(db);

        return next();
    });
});
// Mailer 
app.use(function(req, res, next){
	mailer(function(transport){
		req.transport = transport;
		return next();
	});
});

app.use(favicon());
// replace this with the log4js connect-logger
// app.use(logger('dev'));
app.use(log4js.connectLogger(log4js.getLogger("http"), { level: 'auto' }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride());
app.use(cookieParser());
app.use(multipart({
    uploadDir: settings.upload_path
}));
app.use(session({
    secret: 'your secret here',
    key: 'sid',
    cookie: {
        maxAge: 3600000 * 24 * 7
    },
    store: new SessionStore(settings.database)
}));
app.use(passport.initialize());
app.use(passport.session());
// app.use(modRewrite([
//                 '!\\.html|\\.js|\\.css|\\woff|\\ttf|\\swf$ /index.html [L]'
//               ]));
// app.use(express.static(path.join(__dirname, '../frontend/app')));
if (app.get('env') === 'development') {
    app.use(express.static(path.join(__dirname, '../frontend/app/')));
    app.use(errorHandler({
        dumpExceptions: true,
        showStack: true
    }));
} else {
    // production
    app.use(express.static(path.join(__dirname, '../frontend/dist/')));
    app.use(errorHandler());
};

//Bootstrap controllers
//var routesPath = path.join(__dirname, './routes/');
//fs.readdirSync(routesPath).forEach(function(file) {
//    require(routesPath + file)(app);
//});
require('./routes')(app);

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
