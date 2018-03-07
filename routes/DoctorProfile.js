
const express = require("express");
const router  = express.Router();
var Doctor   = require("../models/doctor");
var multer    = require("multer");
var TDate     = require("../models/Date");
var upload = multer({ dest: 'public/images/Doctor' });  

router.get("/", isLogedin ,(req,res) => {
    if (req.user.isDoctor && req.isAuthenticated() && req.session.Doctor ) {
            var query = req.query['name'];

        if (query && query !== undefined  && isNaN(query)) {
            if (query.length > 2) {
                
                Doctor.findOne({_id:req.user.DoctorID}).exec(function (err,Doc) { 
                    if (err) {
                        throw err ;
                    } else {
                        if (!Doc) {
                            res.location("/logout");
                            res.redirect("/logout");
                        } else {
                           var count = 0;
                            TDate.findOne({DoctorID:req.user.DoctorID},(err,Da) => {
                               if (err) {
                                   throw err;
                               } 
                               count = Da.count ;
                     
                            res.render("profileDoctor" ,{Doc:Doc,count:count});
                               
                            });
                        }
                    }
                 });
            }else{
                res.location("/logout");
                res.redirect("/logout");
            }
            
        }else{
            res.location("/logout");
            res.redirect("/logout");
        }

    } else {
        res.location("/logout");
        res.redirect("/logout");
        
    }
});


router.post("/Edit1",(req,res,next) => {

    var name  = req.body.name ,
        email = req.body.email ,
        Docsession = req.session.Doctor.username ,
        about    = req.body.about ,
        doctor   = req.user.username ;

     req.checkBody("name","Name Is Required Dr ").notEmpty().isLength({min:6,max:30}) ;
     req.checkBody("email","E-mail Is Required Dr ").notEmpty().isEmail().isLength({min:6,max:50});

     req.checkBody("about","about Is Required Dr ").notEmpty().isLength({min:10,max:220}) ;
    
    var Errors = req.validationErrors();        

    if (Errors) {
        res.render("ProfileDoctor",{errors:Errors}) ;
    } else {
        
        if (req.isAuthenticated() && req.user.isDoctor ==true && req.session.Doctor) {
            Doctor.findOne({_id:req.user.DoctorID}).exec(function (err,Doc) { 
                if (err) {
                    throw err ;
                } else {
                    if (!Doc) {
                        Errors = [{msg:"No Doctor Found To Update ?? "}];
                        res.render("ProfileDoctor",{errors:Errors}) ;
                    } else {
                        Doc.name = name ;
                        Doc.email = email;
                        Doc.About = about ;

                        Doc.save((err,result) => {
                            if (result) {
                                res.location("/profile");
                                res.redirect("/profile");
                                
                            }else{
                                res.render("ProfileDoctor",{errors:err.message}) ;             
                            }
                        });
                    }
                }
             });
        }else{
            res.location('/logout');
            res.redirect('/logout');
            
        }
    
    }
    
});

router.post("/Edit2", upload.single('avatar') ,(req,res,next) => {

    var workS  = req.body.workS ,
        workE = req.body.workE ,
        locationArea = req.body.locationArea ,
        fileName = req.file.filename ;
        doctor   = req.user.username ;

     req.checkBody("workS","workS Is Required Dr ").notEmpty();

     req.checkBody("workE","workE Is Required Dr ").notEmpty();

     req.checkBody("locationArea","locationArea Is Required Dr ").notEmpty().isLength({min:5,max:100}) ;
    
    var Errors = req.validationErrors();        

    if (Errors) {
        res.render("ProfileDoctor",{errors:Errors}) ;
    } else {
        
        if (req.isAuthenticated() && req.user.isDoctor ==true && req.session.Doctor) {
            Doctor.findOne({_id:req.user.DoctorID}).exec(function (err,Doc) { 
                if (err) {
                    throw err ;
                } else {
                    if (!Doc) {
                        Errors = [{msg:"No Doctor Found To Update ?? "}];
                        res.render("ProfileDoctor",{errors:Errors}) ;
                    } else {
                        var validMime = ["png","jpeg","jpg" ,"gif"];
                        if (req.file.size > 2 * 1024 * 1024 || validMime.includes(req.file.mimetype.toLowerCase()) ) {
                         var    errors = [{msg:"Image Size Should Be smaller than 2 MB  and extension:  .gif .png .jpeg .jpg " }];
                            res.render("ProfileDoctor" ,{errors:errors});
                        } else {
                           Doc.image = fileName;
                           Doc.workE = workE;
                           Doc.locationArea = locationArea ;
                           Doc.workS = workS ;

                           Doc.save(function (err,re) {
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
        }else{
            res.location('/logout');
            res.redirect('/logout');
            
        }
    
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
