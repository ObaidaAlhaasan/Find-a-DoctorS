var express = require('express');
var router = express.Router();
var passport = require("passport");
var Categories = require("../models/category");
var Countries  = require("../models/country");
var Doctor     = require("../models/doctor");
var User       = require("../models/users");

var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');

// const csruf = require("csurf");

// var csurfProtection = csruf();
// router.use(csurfProtection);

router.get("/" ,(req,res) => {
    var user = req.session.user ;
    
    res.render("index" , {title:"Find-a-Doctor" , user:user});
});


router.get("/doctors" ,  (req,res) => {

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
                 res.render("doctors" ,{title:"Find-a-Doctor" , Cats:Cats ,Counts : Counts});
            }
        }) ; 
       } 
    });


});


// router to show doctor profile


router.get("/DoctorProfile"  ,(req,res,next) => {
    nameDoc = "maha";
    Doctor.findOne({name:nameDoc} ,(err , Doc) => {
        if (err) {
            throw err ; 
        } else {
            if (!Doc) {
                res.location("/doctors");
                
                res.redirect("/doctors");

            } else {
                res.render("profileDoctor" ,{Doc:Doc});
            }
        }        
    });

});



router.post("/DoctorProfile" ,isLogedin ,(req,res,next) => {
    var nameDoctor = req.body.nameDoctor ;
    var user  = req.session.user ;
    Doctor.findOne({name:nameDoctor} ,(err , Doc) => {
        if (err) {
            throw err ; 
        } else {
            if (!Doc) {
                res.location("/doctors");
                
                res.redirect("/doctors");

            } else {
                // should protect this by check if req.session

                res.render("profileDoctor" ,{Doc:Doc,user:user});
            
            }
        }        
    });

});



//  route to rating Doctor



router.post("/rating",(req,res,next) => {
    if (req.session.user) {
        var user = req.session.user ;
        var username = req.session.user.username,
            nameDoc  = req.body.name  ,
            rating   = req.body.rating ;
            Doctor.findOne({name:nameDoc},(err,Doc) => {
            if (err) {
                throw err ;
            } else {
                if (!Doc) {
                    req.flash("error" , "No Doctor Found !");
                    res.location("/doctors/");
                    res.redirect("/doctors/");
                } else {

                    if (Doc.rating.includes(username)) {
                        
                        res.render("profileDoctor" ,{Doc:Doc ,user:user});
                                               
                    }else{
                        
                        Doc.rating.push(username);
                        Doc.ratingUsers.push(rating);
                        Doc.save(function (err , re) { 

                            if (err) {
                                throw err ;
                            } else {
                                req.flash("success" , "You rating Doctor Successful  thanks");
                                res.render("profileDoctor" ,{Doc:Doc,user:user});

                            }
    
                         });
                    }

                }
            }            
        });
    } else {
        res.location("/logout");
        res.redirect("/logout");
    }
});



router.post("/comment" ,  (req,res,next) => {
    
    if (!req.session.user) {
        res.location("/logout");
        res.location("/logout");
        
    }else{



    var nameDoc = req.body.name ,
        username = req.session.user.username,
        comment  = req.body.comment    ; 
    var user     = req.session.user ;
    req.checkBody("comment" ,"Comment Is required To Countinue please ?").notEmpty().isLength({min:10 , max:80}); 
    // .matches(/^[a-zA-Z0-9 ]+$/) ;
    var errors = req.validationErrors();

    if (errors  ) {
        res.render("profileDoctor" ,{errors:errors} );
    }else if ( !username){
        res.location("/logout");
        res.redirect("/logout");
        
    } else {
        
        Doctor.findOne({name:nameDoc} ,(err , Doc) => {
         if (err) {
             throw err ;
         } else {
             
             if (!Doc) {

                 errors  = [{msg:"No Doctor Found !!"}];
                 res.render("profileDoctor" ,{errors:errors} );
             } else {
                
                Doc.comments.unshift({username:username , msg:comment})  ; 
                Doc.save(function (err,re) {
                    if (err) {
                        throw err ;
                    }
                    if (re) {
                        res.render("profileDoctor" ,{Doc:Doc,user:user});

                    }

                  });
             }
         }   
        });
    }
 }
    
});

// rout post for edit comment 


router.post("/EditComment",(req,res,next) => {
   
        var  nameUser   = req.body.nameUser ;
            
        if (req.session.user.username == nameUser) {
            var messageDoc = req.body.message ,
            nameDoc    = req.body.nameDoc ,
            username   = req.session.user.username ;
     
            Doctor.findOne({name:nameDoc},(err,Doc) => {
               if (err) {
                   throw err ;
               } else {
                   if (!Doc) {
                        res.location("/doctors");
                       res.redirect("/doctors");
                   } else {
                    res.render("EditComment",{Doc:Doc,messageDoc:messageDoc,nameUser:nameUser});                    
                   }
               } 
            });
            
        }else{
            res.location("/logout");
            res.redirect("/logout");
        }
   
});
//  the route for completing edit comment user

router.post("/EditCommentS",(req,res,next) => {
   
    var  nameUser   = req.body.nameUser ;
            
    if (req.session.user.username == nameUser) {
        var comment = req.body.message ,
        oldComment  = req.body.oldComment,
        nameDoc    = req.body.nameDoc ,
        username   = req.session.user.username ;
 
        Doctor.findOne({name:nameDoc},(err,Doc) => {
           if (err) {
               throw err ;
           } else {
               if (!Doc) {
                    res.location("/doctors");
                   res.redirect("/doctors");
               } else {

                // Doc.comments.forEach(object => {
                   
                //     for (const key in object) {
                //         if (object.hasOwnProperty(key)) {
                //             const value = object[key];
                            
                //             if ( object["msg"]==oldComment && value == username) {
                //                 object["msg"] = comment ;  
                //             }
                //         }
                //     }
                // });

                Doc.comments.map(function (ele ,ind) {  
                    console.log(ele["username"]);
                    console.log(ele["msg"]);
                    if (ele["username"] == username && ele["msg"] == oldComment) {
                        ele["msg"] = comment ;
                    }else{
                        return ele ;
                    }
                });




                Doc.save(function (err , re) { 
                    if (err) {
                        throw err ;
                    } else {
                        var user = req.session.user ;
                        res.render("profileDoctor" ,{Doc:Doc,user:user});
                    }
                 });
                }
           } 
        });
        
    }else{
        res.location("/logout");
        res.redirect("/logout");
    }

});








router.get("/Config" , isLogedin , (req,res) => {
    //  check if admin how come to this route
   res.render("/" , {title:"Config"}); 
});


router.post("/Config" ,  isLogedin,(req,res) => {

    var nameCategory = req.body.category ;
    var    nameCountry  = req.body.country ;

    

        if (nameCategory.length > 0 ) {
            Categories.findOne({name:nameCategory} , (err , data) => {
               if (err) {
                   throw err ;
               } else {
                if (data) {
                    var errors = {msg:"Error Category already exists"};
                    res.render("Config" , {errors:errors , title:"Find-a-Doctor"});
                } else {
                    var newCategory = new Categories({
                        name:nameCategory
                    });
                    newCategory.save(function (err) {
                        if (err) {
                            throw err ;
                        }
                        res.location("/doctors");
                        res.redirect("/doctors");
                        
                      });
                }
               } 
            });
        }else if (nameCountry.length > 0 ){
            
            Countries.findOne({name:nameCountry} , (err , data) => {
                if (err) {
                    throw err ;
                } else {
                 if (data) {
                     var errors = {msg:"Error Country already exists"};
                     res.render("Config" , {errors:errors , title:"Find-a-Doctor"});
                 } else {
                     var newCountry = new Countries({
                         name:nameCountry
                     });
                     newCountry.save(function (err) {
                         if (err) {
                             throw err ;
                         }
                         res.location("/doctors");
                         res.redirect("/doctors");
                         
                       });
                 }
                } 
             });
        }else{
           var errors = {msg:"Error ADD something Is Required"};
            res.render("Config" , {errors:errors , title:"Find-a-Doctor"});
        }
 });

//  Browse Doctors By get route thats have category and country

router.post("/BrowseDoctors" ,(req,res , next) => {
    var country  = req.body.country ,
        category = req.body.category ;
    Doctor.find({country:country , category:category} ,(err , Doc) => {
        if (err) {
            throw err ;
        }
        var Docs = Doc ;

        res.render("BrowseDoctor" , {title:"Find-a-Doctor" , Docs:Docs});
    });
    
});
//  route for sending post for email  by contact 

router.post("/sendPost"  , (req,res , next) => {
    var name  = req.body.name ,
        emailU = req.body.email,
        message   = req.body.message ;
        
    req.checkBody("name" , "Name Is required AND a Valid Name").notEmpty().isAlphanumeric() ;
    
    
    req.checkBody("name" , "Name Is required AND at least 3 Chars but No more 30 Chars").isLength({min:3 , max:30});
    req.checkBody("emailU" , "E-mail Is required AND a Valid E-mail").notEmpty().isEmail() ;
    req.checkBody("emailU" , "E-mail at least 7 chars should be  ").isLength({min:7 , max:60});

    req.checkBody("message" , "Message Is required").notEmpty().isLength({min:10 , max:250});

    var errors = req.validationErrors();
    if (errors ) {

        res.render("contact" , {errors:errors , name:name , emailU:emailU , message:message});
        
    } else {
        // use sendgrid to send email 
        var options = {
            auth: {
                api_key: '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'
            }
        } ;
    
        var client = nodemailer.createTransport(sgTransport(options));
        var email = {
            from:'Find-a-Doctor : '+ emailU ,
            to: "Mr : Obaida Alhassan",
            subject: 'Message From Contact page ',
            text: 'Hello Mr Obaida I am ' + name + " I would Tell you that  " + message  ,
            html: 'Hello mr Obaida I am <strong> ' + name + '</strong>,<br><br>  <h3>'+ message +' </h3 '
        };

        client.sendMail(email, function (err, info) {
            if (err) {
                console.log(err);
            }
        });
        // for testing 
        next();
    }


});



router.get("/logout", function (req, res, next) {

            req.logOut();
            res.redirect("/");  

});






// function to protect routes

function isLogedin(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.oldUrl = req.url;
    res.redirect("/signin");
}

module.exports = router;
