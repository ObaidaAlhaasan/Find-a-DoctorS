var express = require('express');
var router = express.Router();
var passport = require("passport");
var Categories = require("../models/category");
var Countries  = require("../models/country");
var Doctor     = require("../models/doctor");
var User       = require("../models/users");
var Post       = require("../models/post");

var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');

// const csruf = require("csurf");

// var csurfProtection = csruf();
// router.use(csurfProtection);

router.get("/" ,(req,res) => {
    var user = req.user ;
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
                var user = req.session.user ;
                 res.render("doctors" ,{title:"Find-a-Doctor" ,user:user, Cats:Cats ,Counts : Counts});
            }
        }) ; 
       } 
    });
});


// router to show doctor profile



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
//  the route for completing  edit comment user

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
                
                Doc.comments.forEach(element => {

                    if (element.msg === oldComment  && element.username == username) {
                        element.msg = comment ;
                        
                    Doc.markModified('comments');
                        
                        return element ;                        
                    }
                     return element ;
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
    //  check if admin who come to this route
   res.render("Config" , {title:"Config"}); 
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
                api_key: ""
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
    } 

});

//  route test for feed back

router.get('/feedback', (req, res) => {
    var user = req.session.user ;   

    
        Post.find({}).sort({date:-1}).exec(function (err , POSTS) { 
            if (err) {
                console.log(err);                
            }else{
                if (req.isAuthenticated() && user) {

                    res.render("feedback" , {posts:POSTS,user:user});
                } else {
                    res.render("feedback"  , {posts:POSTS});
                }
            }
            
        
         });

});

router.post('/feedback', (req, res) => {
    if (req.session.user) {
        var username = req.session.user.username ,
            title    = req.body.title,
            post     = req.body.post ,
            user     = req.session.user ;

        req.checkBody("title" ,"title Is Required").notEmpty().isLength({min:6 , max:100}) ;
        req.checkBody("post" ,"Post Is Required").notEmpty().isLength({min:10 , max:250}) ;
        
        var errors = req.validationErrors();


        if (errors) {
            res.render("feedback",{user:user , errors:errors});
        } else {
            
            var newPost = new Post({
                title:title ,
                user:req.session.user.id,
                username:req.session.user.username,
                post:post
            });
            newPost.save(function (err,re) { 
                if (err) {
                    throw err ;
                }
            
                res.location("/feedback");
                res.redirect("/feedback");
                

            });

        }

    } else {
        
        res.location("/signin");
        res.redirect("/signin");
    }
});


router.get("/likepost/:id",(req,res,next) => {
var user = req.session.user ;

    if (req.isAuthenticated() && user && req.params.id) {
        
        Post.findOne({_id:req.params.id},function (err,data) { 
            if (err) {
                throw err;
            } else {
                if (data.dislike.includes(user.username)) {

                    data.dislike.splice(data.dislike.indexOf(user.username),1);
                    data.dislikes--;
                    data.like.push(user.username);
                    data.likes++ ;

                } else {
                    if (data.like.includes(user.username)) {
                        next();
                    } else {
                        data.like.push(user.username);
                        data.likes++ ;
                    }
                }
            }

            data.save(function (err,re) {
                if (err) {
                    throw err  ;
                } else {
                    res.location("/feedback");
                    res.redirect("/feedback"); 
                }
               });

         }); 


    } else {
        
 res.location("/feedback");
 res.redirect("/feedback");
 
    }

});

// 


router.get("/dislikepost/:id",(req,res,next) => {
    var user = req.session.user ;
    
        if (req.isAuthenticated() && user && req.params.id) {
            
            Post.findOne({_id:req.params.id},function (err,data) { 
                if (err) {
                    throw err;
                } else {
                    if (data.like.includes(user.username)) {
    
                        data.like.splice(data.like.indexOf(user.username),1);
                        data.likes--;
                        data.dislike.push(user.username);
                        data.dislikes++ ;
    
                    } else {
                        if (data.dislike.includes(user.username)) {
                            next();
                        } else {
                            data.dislike.push(user.username);
                            data.dislikes++ ;
                        }
                    }
                }
    
                data.save(function (err,re) {
                    if (err) {
                        throw err  ;
                    } else {
                        res.location("/feedback");
                        res.redirect("/feedback"); 
                    }
                   });
    
             }); 
    
    
        } else {
            
     res.location("/feedback");
     res.redirect("/feedback");
     
        }
    
    });

    // ADD comment on post feed back

    router.get("/postComment/:id",(req,res,next) => {
       var user = req.session.user ;
       
       if (user && req.isAuthenticated()&& req.params.id) {
           Post.findOne({_id:req.params.id},(err,data) => {
               if (err) {
                  console.log(err.message);
                  
                  res.location("/feedback");
                  res.redirect("/feedback");
                  
               }else {
               if (!data) {
                res.location("/feedback");
                res.redirect("/feedback");
               } else {
                   res.render("postComment",{data:data});
               }
            }
               

           });
       } else {
           res.location("/feedback");
           res.redirect("/feedback");
       }
    });
    // post comment 

    router.post("/postComment",(req,res,next) => {

        var user  = req.session.user ,
            comment = req.body.comment,
            postID  = req.body.postID ;

            if (req.isAuthenticated() && user) {
            Post.findOne({_id:postID},(err,post) => {
                if (err) {
                    console.log(err.message);
                    
                    res.location("/postComment/"+postID);
                    res.redirect("/postComment/"+postID);
                } else {
                    if (!post) {
                        res.location("/postComment/"+postID);
                        res.redirect("/postComment/"+postID);
                    } else {
                    
                    post.comments.push({username:user.username , msg:comment});
                    post.comment++ ;
                    post.save(function (err,re) { 
                        if (err) {
                            throw err ; 
                        } else {
                            res.location("/feedback");
                            res.redirect("/feedback");
                        }
                     });
                    }
                }
            });                
            } else {
                res.location("/postComment/"+postID);
                res.redirect("/postComment/"+postID);
            }
    
    });

    //  delete post 

    router.get("/deletepost/:id",(req,res,next) => {
        var user = req.session.user ,

            postID = req.params.id ;

        // check for same username then delete post 
        if (req.isAuthenticated() && user && postID) {
            Post.findOneAndRemove({_id:postID},(err) => {
                if (err) {
                    throw err ;
                } else {
                    
                    res.location("/feedback");
                    res.redirect("/feedback");
                    
                }
            });
    
        } else {
            
            res.location("/feedback");
            res.redirect("/feedback");
        }

    });

// route edit comment 


router.get("/editPost/:id",(req,res,next) => {
    var user = req.session.user ;
    
    if (user && req.isAuthenticated()&& req.params.id) {
        Post.findOne({_id:req.params.id},(err,post) => {
            if (err) {
               console.log(err.message);
               
               res.location("/feedback");
               res.redirect("/feedback");
               
            }else {
            if (!post) {
             res.location("/feedback");
             res.redirect("/feedback");
            } else {

                res.render("postComment",{post:post});
            
            }
         }
            
        });
    } else {
        res.location("/feedback");
        res.redirect("/feedback");
    }
 });

//  route  edit  post

router.post('/editpost', (req, res) => {
    var user = req.session.user ,
        postID = req.body.postID,
        oldpost = req.body.oldpost,
        post   = req.body.post  ,
        title  = req.body.title ;

        if (user && req.isAuthenticated()) {
            Post.findOne({_id:postID}, (err,data) => {
                if (err) {
                    console.log(err);
                    res.location("/feedback");
                    res.redirect("/feedback");
                } else {
                    if (!data) {
                        res.location("/feedback");
                        res.redirect("/feedback");
                    } else {
                        
                        if (data.user == user.id && data.post === oldpost) {
                            data.post  = post ;
                            data.title = title ;
                            data.save(function (err,re) { 
                                if (err) {
                                    throw err ;
                                } else {
                                    console.log("success");
                                    res.location("/feedback");
                                    res.redirect("/feedback");
                                }
                             });
                            
                        } else {
                            res.location("/feedback");
                            res.redirect("/feedback");
                        }
                    }
                }
            });


        } else {
            res.location("/feedback");
            res.redirect("/feedback");
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
