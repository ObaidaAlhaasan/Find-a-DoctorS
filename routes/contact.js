const express = require('express');
const router  = express.Router();
// const nodemailer = require("nodemailer");




router.get("/",(req,res,next) => {
    res.render("contact",{title:"Contact"}) ;
 });
 

 module.exports = router ;