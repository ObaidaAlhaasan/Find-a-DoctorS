var mongoose  = require("mongoose");
var express = require('express');
var router = express.Router();
var passport = require("passport");

var Categories = require("../models/category");
var Countries  = require("../models/country");
var Doctor     = require("../models/doctor");
var User       = require("../models/users");

// var csruf = require("csurf");
// var csurfProtection = csruf();
// router.use(csurfProtection);


router.get("/",(req,res,next) => {
  
  Categories.find({} , (err , data) => {
    if (err) {
        throw err ;
    } else {

     var Cats = data ; 
     Countries.find({} , (err , Data) => {
         if (err) {
             throw err ;
         } else {
             Counts = Data ;
            //  , csrfToken:req.csrfToken() 
              res.render("addDoctor" ,{title:"Find-a-Doctor" ,Cats:Cats ,Counts : Counts});
         }
     }) ; 
        
    } 
 });
  
});

router.post("/"  , (req,res,next) => {



  var name    = req.body.first+" " +req.body.second+" " +req.body.last ,
      email   = req.body.email,
      password  = req.body.password ,
      number    = req.body.number ,
      country   = req.body.country,
      category  = req.body.category ,
      practice  = req.body.practice ,
      gradz     = req.body.gradz ,
      workS     = req.body.workS ,
      workE     = req.body.workE  ,
      locationArea  = req.body.locationArea,
      image     = req.body.image ,
      certificate = req.body.certificate ,
      Born        = req.body.Born,
      national    = req.body.national,
      university  = req.body.university,
      About       = req.body.About   ;

    //   for testing 
    var first = req.body.first ,
        second = req.body.second,
        last   = req.body.last ;
     
      req.checkBody("Born","Born Date Is Required ").notEmpty();
      req.checkBody("national","Nationalty   Is Required ").notEmpty();
      req.checkBody("university","university Name  Is Required ").notEmpty();
      req.checkBody("About","About  Is Required ").notEmpty();

      
      req.checkBody("first" ,"First Name Is Required AND Alpha String").notEmpty().isLength({min:2,max:20});
      req.checkBody("second" ,"Second Name Is Required AND Alpha String").notEmpty().isLength({min:2,max:20});
      req.checkBody("last" ,"Last Name Is Required AND Alpha String").notEmpty().isLength({min:2,max:20});

      req.checkBody("email" ,"E-mail Is Required AND  Valid E-mail").notEmpty().isEmail();
      req.checkBody("password" ,"Password Is Required AND  Valid password").notEmpty().matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}/);
      req.checkBody("number" ,"MobileNumber Is Required Valid MobileNumber").notEmpty().isMobilePhone("ar-JO");
      req.checkBody("category" , "Specialities Is Rerquired").notEmpty();
      req.checkBody("country" , "District Is Rerquired").notEmpty();
      req.checkBody("gradz" , "gradz Is Rerquired").notEmpty();
      req.checkBody("workS" , "workTimeStart Is Rerquired").notEmpty();
      req.checkBody("workE" , "workTimeEnd Is Rerquired").notEmpty();
      req.checkBody("locationArea" , "locationArea Is Rerquired").notEmpty().isLength({min:4,max:80});

      var errors = req.validationErrors();
      
      if (errors) {
        res.render("addDoctor" , {errors:errors , name:name,email:email,password:password,practice:practice,gradz:gradz , category:category , country:country,workE:workE,workS:workS,locationArea:locationArea,number:number});
      } else {
        Doctor.findOne({name:name},(err,Doc) => {
            if (err) {
                throw err ;
            } else {
                if (Doc) {
                    var errors = [{msg:"Doctor Name ALready exists ??? "}];
                res.render("addDoctor" , {errors:errors , name:name,email:email,password:password,practice:practice,gradz:gradz , category:category , country:country,workE:workE,workS:workS,locationArea:locationArea,number:number});
                } else {
                    
                  var newDOCTOR = new Doctor({
                    name:name,
                    email:email,
                    Born  : Born ,
                    national :national,
                    university:university,
                    About:About,
                    password:password,
                    number:number,
                    category:category ,
                    country:country,
                    practice:practice,
                    gradz:gradz , 
                     workE:workE,
                     workS:workS,
                     locationArea:locationArea
                  });

                  newDOCTOR.password = newDOCTOR.encryptPassword(password);
                
                  newDOCTOR.save().then(function () {
                        User.findOne({username:req.user.username}).exec(function (err,user) { 
                            if (err) {
                                throw err ;
                            } else {
                                if (!user) {
                                    res.location("/signin");
                                    res.redirect("/signin");
                                } else {
                                    user.isDoctor = true ;
                                    user.DoctorID = newDOCTOR._id ;
                                    user.image  = newDOCTOR.image ;
                                    user.save(function (err,resa) {
                                        if (err) {
                                            throw err;
                                        }
                                        res.location("/doctors");
                                        res.redirect("/doctors");

                                      });
                                }
                            }
                         }) ;
                     });

                }
            }            
        });
        
      }
    });




// function to protect routes

function isLogedin(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.oldUrl = req.url;
    res.redirect("/signin");
}


module.exports = router ;