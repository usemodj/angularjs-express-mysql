var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var csrf = require('csurf');
var passport = require('passport');
var errorHandler = require('errorhandler');
var fs = require('fs');
var SessionStore = require('express-mysql-session');
//var modRewrite = require('connect-modrewrite');
var multipart = require('connect-multiparty');

var settings = require('./config/settings');
var models = require('./models/index');//index.js
var mailer = require('./config/mailer');
var log4js = require('log4js');

//var log = log4js.getLogger("app");
var app = express();
//  Avoids DEPTH_ZERO_SELF_SIGNED_CERT error
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

//Passport-local Strategy and  DB Models
app.use(function(req, res, next) {
    models(function(err, db) {
        if (err)
            return next(err);
        //database
        req.models = db.models;
        req.db = db;

        //passport-local strategy
        require('./config/passport')(db);
        // load roles data into database
        req.models.roles.loadRoles();

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
/**
* make a log directory, just in case it isn't there.
*/
try {
    fs.mkdirSync(path.join(__dirname, './log'));
} catch (e) {
    if (e.code != 'EEXIST') {
        console.error("Could not set up log directory, error was: ", e);
        process.exit(1);
    }
}
//log4js.configure(path.join(__dirname, './config/log4js.json'));
app.use(log4js.connectLogger(log4js.getLogger("http"), { level: 'debug' }));
//if(process.env.NODE_ENV === 'production') app.use(log4js.connectLogger(log4js.getLogger("production"), { level: 'ERROR' }));
//else app.use(log4js.connectLogger(log4js.getLogger("development"), { level: 'DEBUG' }));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride());
app.use(multipart({
    uploadDir: settings.upload_path
}));
app.use(session({
    secret: 'your secret here',
    key: 'sid',
    // cookie: {
    //     maxAge: 3600000 * 24 * 7
    // },
    store: new SessionStore(settings.database)
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(csrf({cookie: true}));
// error handler
app.use(function (err, req, res, next) {
    if (err.code !== 'EBADCSRFTOKEN') return next(err)
     // handle CSRF token errors here
    res.status(403).send('session has expired or form tampered with')
});

app.use(function (req, res, next) {
    res.cookie('XSRF-TOKEN', req.csrfToken());
//>>> IE brower cache problem >>>
    res.header('Access-Control-Max-Age', 0);
    res.header('Cache-Control', 'max-age=0,no-cache,no-store,post-check=0,pre-check=0,must-revalidate');
    res.header('Expires', '-1');
//>>>
    next()
});

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
}

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

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send('Error ' + err.stacktrace);
});

module.exports = app;
