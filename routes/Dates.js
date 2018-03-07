const express = require('express');
const router  = express.Router();
const Doctor  = require('../models/doctor');
const TDate   = require("../models/Date");
const moment   = require("moment");
const Confirm  = require("../models/confirmDate");

// const nodemailer = require("nodemailer");




router.get("/",(req,res,next) => {

	var Docname = req.query.Drname ,
		user    = req.user ;

	if ( Docname&&req.isAuthenticated()&&user.isDoctor == false && Docname.length > 3 && isNaN(Docname)) {

		Doctor.findOne({name:Docname}).exec((err,Doc) => {
		   if (err) {
			   throw err ;
		   } else {
			   if (!Doc) {
				   console.log("here no found");

				res.location("/logout");
				res.redirect("/logout");

			   } else {
				res.render("Dates" ,{Doc:Doc,user:req.user});
			   }
		   }
		});

	}else{
		res.location("/logout");
		res.redirect("/logout");

	}
});


// router to take a date from Doctor

router.post('/TakeDate', (req, res,next) => {
	var number = req.body.number  ,
		email  = req.body.email ,
		user   = req.user   ;
		Docname= req.body.Docname ;

		req.checkBody("number" ,"Invalid Number Phone ").isMobilePhone("ar-JO").notEmpty();
		req.checkBody("email" ,"Invalid Email  ").isEmail().notEmpty();
		req.checkBody("Docname" ,"Error No Doctor ").notEmpty();
	var errors = req.validationErrors();

	if (errors) {
		res.render("Dates",{Doc:{name:Docname} , errors:errors});

	} else {
		if (req.isAuthenticated() && req.user.isDoctor == false&&user && Docname) {
			Doctor.findOne({name:Docname},(err,Doc) => {
				if (err) {
					throw err ;
				} else {
					if (!Doc) {
						console.log("there no found");

					 res.location("/logout");
					 res.redirect("/logout");

					} else {
					TDate.findOne({DoctorID:Doc._id},(err,Tdate) => {
						// first search of Doctor if  exists
						// second search of user if he already take Date
						// if not found update the schema
						//return false
						/////
						// if doctor is not exisits add one withe this user
						if (err) {
							throw err ;
						} else {
							if (Tdate) {
								var check = [] ,
									checkID = [];
								for (let i = 0; i < Tdate.users.length; i++) {
									const element = Tdate.users[i];
									check.push(element.name);
									checkID.push(String(element.userID));
								}
								if (check.includes(user.username) || checkID.includes(user._id)) {
									errors = [{msg:"You already Sent a Date Request for this Doctor"}];

									res.render("ProfileDoctor" ,{errors:errors ,Doc:Doc,user:user});

								} else {
									Tdate.count++ ;
									Tdate.users.push({
									    name:user.username,
									    email:email,
									    number:number,
									    userID:user._id
									});

								 Tdate.save(function (err,ru) {
								  if (err) {
									throw err ;
								  } else {
									res.location("/profile");
									res.redirect("/profile");

								  }
							});
								}

							} else {

								 var newDate = new TDate();
								newDate.DoctorID = Doc._id;
								newDate.count++ ;
								newDate.users.push({
									name:user.username,
									email:email,
									number:number,
									userID:user._id
								});
								newDate.save(function (err,re) {
									if (err) {
										throw err ;
									}
									res.location("/profile");
									res.redirect("/profile");

								});

							}

						}


					});


					}
				}
			 });
		}else{
			res.location("/logout");
			res.redirect("/logout");
		}
	}

});

//  route for Doctor to see his Dates


router.get('/calendar',(req,res,next) => {
	if (req.isAuthenticated() && req.user && req.user.isDoctor == true ) {
		Doctor.findOne({_id:req.user.DoctorID},(err,Doctor) => {
			if (err) {
				throw err ;
			} else {
				TDate.findOne({DoctorID:Doctor._id},(err,Data) => {
					if (err) {
						throw err ;
					} else {
						if (!Data) {
							res.location("/profile");
							res.redirect("/profile");
						} else {

						res.render("Dates",{Doctor:Doctor,Data:Data});

						}
					}
				}) ;
			}
		}).sort({time_Date:-1})  ;
	} else {
		res.location("/logout");
		res.redirect("/logout");
	}
});

//route for Doctor confirm  Date with user


router.post('/confirmDate',(req,res,next) => {
	var username = req.body.username,
		userID   = req.body.userID,
		email    = req.body.email,

		timeS    = req.body.timeS ,
		timeE    = req.body.timeE ,
		date     = req.body.date ,
		number   = req.body.number ,
		description  = req.body.description ;
	// should delete the order for date from TDate and add reply from doc to
	//	ueser send email for him and notfication also

	req.checkBody("username","User name Is required ?? ").notEmpty();
	req.checkBody("email","email  Is required ?? ").notEmpty();
	req.checkBody("timeS","timeS  Is required ?? ").notEmpty();
	req.checkBody("timeE","timeE  Is required ?? ").notEmpty();
	req.checkBody("date","date  Is required ?? ").notEmpty();

	var errors = req.validationErrors();

	if (errors) {
		res.render("Dates",{errors:errors,Doctor:{name:Docname}});
	}else{
		if (req.isAuthenticated()&& req.user.isDoctor == true ) {

			TDate.findOne({DoctorID:req.user.DoctorID},(err,Data) => {
				if (err) {
					throw err ;
				} else {
					if (!Data) {
						errors = [{msg:"No Doctor ??????"}];
						res.render("Dates",{errors:errors,Doctor:{name:Drname}});
					} else {
						var check = [],
						    checkID = [];
						for (let i = 0; i < Data.users.length; i++) {
							const element = Data.users[i];
							check.push(element.name);
							checkID.push(String(element.userID));
						}

						if ( check.includes(username)|| checkID.includes(userID)) {
							Data.count -- ;
							Data.users.forEach(element => {

								if (element.name === username) {

								Data.users.splice(Data.users.indexOf(element),1);
								}

								return element ;
							});
							Data.save().then(function () { 
								try {
									// check of Doctor if exisits and push date for same array
									//
								Confirm.findOne({DoctorID:req.user.DoctorID},(err,result) => {
									if (err) {
										throw err ;
									}else{
										if (result) {
											var check = [] ,
											checkID = [];
										for (let i = 0; i < result.users.length; i++) {
											const element = result.users[i];
											check.push(element.name);
											checkID.push(String(element.userID));
										}
										if (check.includes(username) || checkID.includes(userID)) {
											errors = [{msg:"You already Sent a Date Confirm for this User"}];
		
											res.render("ProfileDoctor" ,{errors:errors});
		
										} else {

                      Doctor.findOne({_id:req.user.DoctorID},(err,Doc) => {
                        if (err) {
                          throw err ;
                        }else{
                          result.users.push({
                            name:username,
                            email:email,
                            number:number,
                            userID:userID,
                            WDate:date,
                            timeE:timeE,
                            timeS:timeS,
                            description:description,
                            Drname:Doc.name
                            
                          });
                          result.save(function (err,ru) {
                            if (err) {
                            throw err ;
                            } else {
                            res.location("/profile");
                            res.redirect("/profile");
          
                            }
                            });
                        }
                      });

										}

										} else {
                      Doctor.findOne({_id:req.user.DoctorID},(err,Doc) => {
                        if (err) {
                          throw err ;
                        }else{
                          date =moment(date).format("DD-MMM-YYYY");
                          var Nconfirm = new Confirm();
                          Nconfirm.DoctorID = req.user.DoctorID ;
                          Nconfirm.users.push({
                            name:username,
                            email:email,
                            number:number,
                            userID:userID,
                            WDate:date,
                            timeE:timeE,
                            timeS:timeS,
                            description:description,
                            Drname:Doc.name
                          
                          });
                          Nconfirm.save(function (err,ru) {
                            if (err) {
                              throw err;
                            } else {
                              // should send email for users 
        
                              res.location("/profile");
                              res.redirect("/profile");
                            }
                            });	
                        }
                      });

										}
									}
								});	

								} catch (error) {
									console.log(error);
								}
							 });

						} else {
							errors = [{msg:"Some thing went Wrong Error 616. ??????"}];
							res.render("Dates",{errors:errors,Doctor:{name:Drname}});
						}
					}
				}
			});

		} else {
			res.location("/logout");
			res.redirect("/logout");

		}
	}

});

router.get('/notification', (req, res) => {

	var user = req.user ;
	if (req.isAuthenticated() && user && user.isDoctor === false) {
		Confirm.find({},(err,Data) => {
			var array = [];
			Data.map(function (ele,ind) {  
				ele.users.forEach(function (element) { 
					if (element.name === user.username&& String(user._id) === String(element.userID)) {
						array.push(element);
					}
         });
         
         
			});

			if (array.length>0) {
				res.render("Notification",{user:req.user,Data:array});
			} else {
				res.render("Notification",{user:req.user});
			}
		});
	} else {
		res.location("/logout");
		res.redirect("/logout");
	}
});

// route from user For Doctor last Confirm and Delete the Date from DataBase

router.post('/ConfirmUFD', (req, res,next) => {
  var username = req.body.username,
      Drname   = req.body.Drname,
      date     = req.body.date  ,
      timeE    = req.body.timeE ,
      timeS    = req.body.timeS ;      
      Doctor.findOne({name:Drname},(err,Doc) => {
        if (err) {
          throw err;
        } else {
          if (Doc) {
            Confirm.findOne({DoctorID:Doc._id},(err,Data) => {
              if (err) {
                throw err; 
              } else {
                if (!Data) {
                  res.location("/logout");
                  res.redirect("/logout");
                } else {
                  Data.users.forEach(element => {
                    if (element.name === req.user.username || String(element.userID) === String(req.user._id)) {
                      Data.users.splice(Data.users.indexOf(element),1);
                    }
                  });
                  Data.save().then(function (err,rsu) { 

                    try {
                      
                      Doc.msgConfirm.push("USER CONFIRM THE DATE : username "+req.user.username+" Date :  "+date+"  Time Date Start : "  +timeS+ "  Time Date End  : " + timeE);
                      Doc.save(function (err,r) { 
                        if (err ) {
                          throw err ;
                        }
                      res.location("/Dates/notification?name="+req.user.username);
                      res.redirect("/Dates/notification?name="+req.user.username);
                       });
                    } catch (error) {
                      throw error ;
                    }


                   });
                }
              }
            });
          } else {
            res.location("/logout");
            res.redirect("/logout");
            
          }
        }
      });

});

router.get('/NDoctor',(req,res,next) => {

  if (req.isAuthenticated() && req.user.isDoctor === true ) {
    Doctor.findOne({_id:req.user.DoctorID},(err,Doc) => {
      if (err) {
        throw err ;
      } else {
        if (!Doc) {
          res.location("/profile");
          res.redirect("/profile");
        } else {
          res.render("Notification" ,{Doc:Doc});
        }
      }
    });    
  } else {
    res.location("/logout");
    res.redirect("/logout");
  }
});

// route for Delete Notification from doctor msg array 

router.get("/DeleteNotification",(req,res,next) => {
  var query = req.query ;

  if (req.isAuthenticated()&& req.user.isDoctor === true && query) {
    query = Number(query.N);
    
    Doctor.findOne({_id:req.user.DoctorID},(err,Doc) => {
      

      Doc.msgConfirm.splice(Doc.msgConfirm.indexOf(Doc.msgConfirm[query]),1);


      

      Doc.save(function (err,re) {
        if (err) {
          throw err ;
        } else {
          res.location("/Dates/NDoctor?Drname="+Doc.name);
          res.redirect("/Dates/NDoctor?Drname="+Doc.name);
        }
        });
    });
  } else {
    res.location("/logout");
    res.redirect("/logout");
    
  }

});

 module.exports = router ;