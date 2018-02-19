const express = require("express");
const router  = express.Router();
const User    = require("../models/users");
var bcrypt    = require("bcrypt-nodejs");
var multer    = require("multer");
var upload = multer({ dest: 'public/images/' });   
var Doctor   = require("../models/doctor");


router.get("/",isLogedin,(req,res,next) => {
    var user = req.session.user ;
    User.findOne({username:user.username} , (err , useR) => {
       if (err) {
           throw err ;
       } else {
           if (!useR) {
               res.location("/signin");
               res.redirect("/signin");
           } else {
               var user  = useR ;
                res.render('profile' , {title:'profile' , user:user});
               
           }
       } 
    });
});

router.post("/"  , (req,res) => {
    var name  = req.body.name,
        email = req.body.email,
        Old   = req.body.old ,
        password = req.body.password ;

        function    validPassword(password , hash) {
            return bcrypt.compareSync(password,hash) ;
        }

     req.checkBody("name" , "Name Is required And Should Be a Valid Name please").notEmpty().isAlphanumeric();
     req.checkBody("name" , "Name Should Be between 3 and 30 Chars").isLength({min:3 , max:30});   
    
    req.checkBody("email" , "Email Should Be between 7 and 60 Chars").isLength({min:7 , max:50});
    req.checkBody("email" , "Email Is required And Should Be a Valid Name please").notEmpty().isEmail();
    

     var errors =req.validationErrors();

     if (errors && Old.length === 0 && password.length=== 0 ) {
         res.render("profile" , {errors: errors });
     } else {
         var user = req.session.user ;

         if (!errors && Old.length === 0 && password.length=== 0 ) {
             User.findOne({_id:user.id} , (err , useR) => {
                 if (err) {
                     throw err;
                 } else {
                     if (!useR) {
                         var errors = [{msg:"No User Found  Please Sign In !!"}];
                        res.render("profile" , {errors: errors });
                     } else {
                         useR.username = name ;
                         useR.email = email ;
                         console.log(useR);
                         
                         useR.save(function (err,re) {  
                             if (err) {
                                 throw err ;
                             } else {
                                 res.location("/profile");
                                 res.redirect("/profile");
                             }
                         });
                     }
                 }
             });
         } else {
             if (!errors && Old.length !== 0 && password.length !==0) {
                // req.checkBody("Old" , "Old password Is required").notEmpty();
                // req.checkBody("Old","Old Password Should Have One Upper and One lower Case and One special Carectars").matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}/) ;
            
                req.checkBody("password","password Should be  at least 8 Chars").notEmpty().isLength({min:8 , max:30});
                req.checkBody("password","Password Should Have One Upper and One lower Case and One special Carectars  ").matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}/) ;
                
                 errors = req.validationErrors();

                if (errors) {
                    res.render("profile" , {errors: errors });
                } else {

                    User.findOne({_id:user.id} , (err , useR) => {
                        if (err) {
                            throw err ;
                        } else {
                            if (!useR) {
                                var errors = [{msg:"No User Found  Please Sign In !!"}];
                                res.render("profile" , {errors: errors }); 
                            } else {
                                
                             if (validPassword(Old , useR.password)) {

                                if (!errors) {
                                    useR.password = bcrypt.hashSync(password , bcrypt.genSaltSync (10) ,null);
                                    useR.save(function (err,re) {
                                        if (err) {
                                            throw err ;
                                        } else {
                                            res.location("/");
                                            res.redirect("/");
                                        }
                                      });
                                }


                                }else{
                               var errors = [{msg:"Your Old Password Is Not Match please Enter Your Old Password Correctly ! "}]    ;
                               res.render("profile" , {errors:errors});
                                }

                            }
                        }
                    });

                }

             } else {
                errors = [{msg:"Error Should Provide Old Password And New Password"}]; 
                res.render("profile" , {errors:errors});

             }
         }
     }
});



router.post("/uploadImage" , upload.single('avatar') , (req,res,next) => {
    
    if (req.file) {
    var avatar = req.file.avatar ;
    var fileName = req.file.filename    ;
    var user = req.session.user ;
    
        User.findOne({_id:user.id} , (err,useR) => {
           if (err){
               throw err ;
           }else{
               
               if (!useR) {
                var errors = [{msg:" No User Found please Sign in !"}];
                res.render("profile" ,{errors:errors});
               } else {
                   var validMime = ["png","jpeg","jpg" ,"gif"];
                if (req.file.size > 2 * 1024 * 1024 || validMime.includes(req.file.mimetype.toLowerCase()) ) {
                    errors = [{msg:"Image Size Should Be smaller than 2 MB  and extension:  .gif .png .jpeg .jpg " }];
                    res.render("profile" ,{errors:errors});
                } else {
                   useR.image = fileName;
                   useR.save(function (err,re) {
                        if (err) {
                            throw err ;
                        } else {
                            res.location("/profile");
                            res.redirect("/profile");
                        }
                     }); 
                }
               }
           }
        
        });
    } else {
        var errors = [{msg:"Provide Image required to continue !"}];
        res.render("profile" ,{errors:errors});
    }

});










function isLogedin(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.oldUrl = req.url;
    res.redirect("/signin");
}

module.exports = router ;