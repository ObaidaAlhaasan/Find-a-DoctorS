var express = require('express');
var router = express.Router();
var passport = require("passport");
var User     = require("../models/users");
var  csruf = require("csurf");
var csurfProtection = csruf();
router.use(csurfProtection);

/* GET home page. */

router.get('/', function(req, res, next) {

res.render("signup", {
    csrfToken: req.csrfToken() ,
    title:"Signup"
});
});

router.post("/" , (req,res) => {

var username = req.body.username ,
    email = req.body.email ,
    password = req.body.password,
    confirm = req.body.confirm ;

req.checkBody("username" , "username is required please").notEmpty();
req.checkBody("email" , "email is required please").notEmpty();
req.checkBody("password" , "password is required please").notEmpty();
req.checkBody("confirm" , "confirm is required please").notEmpty();

req.checkBody("username" , "username at least 3 , max 25 chars and Alphanumeric").isAlphanumeric().isLength({min:3 , max :25});
req.checkBody("email" , "should be a valid email please").matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)  ;

req.checkBody("password" , "password Should have 1 Number, 1 Upper Case , 1 Lower Case at least 8 Chars").matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}/) ;

req.checkBody("confirm" , "confirm Should Be equals to password").notEmpty().equals(password)  ;

var errors = req.validationErrors();

    if (errors) {
      res.render("signup" , {errors:errors , username:username , email:email , password:password , confirm:confirm});
    }else{
      User.findOne({username:username} ,(err , user) => {
        if (err) {
          throw err ;
        } else {

          if (user) {
            var errors = [{msg:"User  Name already taken sorry !"}];
            res.render("signup" , {errors:errors , username:username , email:email , password:password , confirm:confirm});
          } else {
          User.findOne({email:email } , (err , Euser) => {
            if (err) {
              throw err ;
            } else {
                  if (Euser) {
                          var errors = [{msg:"E-mail already taken sorry !"}];
                          res.render("signup" , {errors:errors , username:username , email:email , password:password , confirm:confirm}); 
                  } else {
                          var newUser = new User({
                            username:username ,
                            password : password ,
                            email :email 
                          });
                          newUser.password = newUser.encryptPassword(password);
                          newUser.save(function (err) { 
                            if (err) {
                              console.log(err);
                              
                            } else {
                              res.location("/signin");
                              res.redirect("/signin");
                            }
                          });
                  }
            }
          });
          }
        }
      });
    }
});

module.exports = router;
