var express = require('express');
var router = express.Router();
var passport = require("passport");
var localStrategy  = require("passport-local").Strategy ;
var User           = require("../models/users");
const csruf = require("csurf");
var csurfProtection = csruf();
router.use(csurfProtection);

/* GET home page. */



passport.serializeUser(function (user, done) {
  done(null, user.id);
});


passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
      done(err, user);
  });
});


passport.use('local.signin', new localStrategy({

  usernameField: "username",
  passwordField: "password",
  passReqToCallback: true
}, function (req, username, password, done) {
  req.checkBody("username","Invalide username").notEmpty() ;
  req.checkBody("password","Invalide password").notEmpty() ;
  var errors = req.validationErrors()  ;
  if (errors) {
  var messages = [] ;
      errors.forEach( function (err) {
          messages.push(err.msg);
      });
      return done (null,false ,req.flash("error",messages));

  }

  User.findOne({
    username: username
  }, function (err, user) {
      if (err) {
          return done(err) ; 
      }

      if (!user) {
          return done(null, false, {
              message: "No User Found..!  "
          });
      }

      
  if (!user.validPassword(password)) {
      return done(null , false, {message:"Wrong Password..?"})  ;
  }


  req.session.user = {username:user.username , id:user._id,image:user.image} ;
  
  return done(null , user);

  });
}));



router.get("/", (req, res, next) => {
  var messages = req.flash("error");

  res.render("signin", {
      csrfToken: req.csrfToken(),
      messages: messages,
      hasErrors: messages.length > 0
  });

});

router.post("/", passport.authenticate('local.signin', {
  failureRedirect: "/signin",
  failureFlash: true 
}), function (req, res, next) {
  if (req.session.oldUrl) {
      var oldUrll =   req.session.oldUrl ;
      req.session.oldUrl = null;

      res.redirect(oldUrll);

  } else {
      res.redirect("/profile");
  }
});






module.exports = router;
