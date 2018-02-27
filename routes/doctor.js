
const express = require("express");
const router  = express.Router();
var Doctor   = require("../models/doctor");



function isLogedin(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.oldUrl = req.url;
    res.redirect("/signin");
}



module.exports = router ;
