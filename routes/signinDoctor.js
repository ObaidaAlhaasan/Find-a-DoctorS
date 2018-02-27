var express = require('express');
var router = express.Router();
var passport = require("passport");
var localStrategy  = require("passport-local").Strategy ;
var Doctor           = require("../models/doctor");
const csruf = require("csurf");
var csurfProtection = csruf();
router.use(csurfProtection);

/* GET home page. */



passport.serializeUser(function (doctor, done) {
  done(null, doctor.id);
});

passport.deserializeUser(function (id, done) {
  Doctor.findById(id, function (err, doctor) {
      done(err, doctor);
  });
});


passport.use('local.signinDoc', new localStrategy({

  usernameField: "email",
  passwordField: "password",
  passReqToCallback: true
}, function (req, email, password, done) {
  req.checkBody("email","Invalide username").notEmpty().isEmail().matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)  ;
  req.checkBody("password","Invalide password").notEmpty().matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}/) ;
  var errors = req.validationErrors()  ;
  if (errors) {
  var messages = [] ;
      errors.forEach( function (err) {
          messages.push(err.msg);
      });
      return done (null,false ,req.flash("error",messages));

  }

  Doctor.findOne({
    email: email
  }, function (err, doctor) {
      if (err) {
          return done(err) ; 
      }

      if (!doctor) {
          return done(null, false, {
              message: "No Doctor Found..!  "
          });
      }

      
  if (!doctor.validPassword(password)) {
      return done(null , false, {message:"Wrong Password..?"})  ;
  }


  req.session.Doctor = {name:doctor.name ,image:doctor.image} ;
  
  return done(null , doctor);

  });
}));



router.get("/", (req, res, next) => {
  var messages = req.flash("error");

  res.render("signinDoc", {
      csrfToken: req.csrfToken(),
      messages: messages,
      hasErrors: messages.length > 0
  });

});

router.post("/", passport.authenticate('local.signinDoc', {
  failureRedirect: "/signinDoctor",
  failureFlash: true 
}), function (req, res, next) {
  if (req.session.oldUrl) {
      var oldUrll =   req.session.oldUrl ;
      req.session.oldUrl = null;

      res.redirect(oldUrll);

  } else {
      console.log("success Doc login");
      
      res.redirect("/");
  }
});






module.exports = router;
