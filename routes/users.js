var express = require('express');
var router = express.Router();

/* GET users listing. */

router.get('/', function(req, res, next) {
  console.log(req.session.user , "session");
  
  console.log(req.user , "user ");
  
  res.render('profile');
});




module.exports = router;
