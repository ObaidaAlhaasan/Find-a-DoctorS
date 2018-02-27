var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var port       = process.env.PORT || 8080 ;
var session  = require("express-session");
var flash      = require("connect-flash");
var passport  = require("passport");
var localStrategy = require("passport-local");
var mongodb    = require("mongodb");
var mongoose    = require("mongoose");
var expressValidator = require("express-validator");

var index = require('./routes/index');
var signin = require('./routes/signin');
var signup = require('./routes/signup');
var about     = require("./routes/about");
var ADD        = require("./routes/addDoctor");
var contact    = require("./routes/contact");
var about      = require("./routes/about");
var profile    = require ("./routes/profile");
var doctor     = require("./routes/doctor");  
var signinDoctor = require("./routes/signinDoctor");

var app = express();



//  connect to database and run server on port 

app.listen(port , function (err) { 
  console.log("Server Running on port => " +port);
 });
 
 
 mongoose.connect("mongodb://localhost:27017/findDoc"  ,(err) => {
   if (err) {
     console.log(err);
   } else {
     console.log("connected to database ");
   }
 });


//  require("./config/passport");


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs'); 

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.use(cookieParser());
app.use(session({
  secret:"Shadow" ,
  resave:true,
  saveUninitialized:true ,
  cookie:{maxAge:490*60*1000}
}));

app.use(passport.initialize()) ;
app.use(passport.session());
app.use(expressValidator());

app.use(express.static(path.join(__dirname, 'public')));

app.use(flash());

app.use(function (req, res, next) {
  res.locals.login = req.isAuthenticated();
  res.locals.notlogedin = !req.isAuthenticated();
  res.locals.session = req.session ; 
  res.locals.messages  = require("express-messages")(req,res);
  
  next();
});

app.use('/', index);
app.use('/signin', signin);
app.use('/signinDoctor', signinDoctor);

app.use("/signup",signup);
app.use("/about" , about);
app.use("/contact" , contact);
app.use("/profile" , profile);
app.use("/doctor" , doctor);


app.use("/addDoctor" , ADD);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
