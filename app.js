var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./server/routes/index');
var users = require('./server/routes/users');
// Import comments controller
var comments = require('./server/controllers/comments');

var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore= require('connect-mongo')(session);
var passport = require('passport');
var flash = require('connect-flash');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'server/views/pages'));
app.set('view engine', 'ejs');

var config=require('./server/config/config.js');

mongoose.connect(config.url);
mongoose.connection.on('error',function(){
    console.error('MongoDB connection error. Make sure mongodb is running');

});

require('./server/config/passport')(passport);






app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret:'sometextgohere',
    saveUninitialized:true,
    resave:true,
    store: new MongoStore({
        url:config.url,
        collection:'sessions'
    })
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());



app.use('/', routes);
app.use('/users', users);
// Setup routes for comments
app.get('/comments', comments.hasAuthorization, comments.list);
app.post('/comments', comments.hasAuthorization, comments.create);
 
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
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
app.set('port',process.env.PORT || 3000);
var server=app.listen(app.get('port'),function(){
    console.log('Express server listening on port'+ server.address().port);
});
