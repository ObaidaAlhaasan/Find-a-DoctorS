var mongoose = require("mongoose");
var Schema   = mongoose.Schema ;
var bcrypt   = require("bcrypt-nodejs");

var Doctor = new Schema({
    name:{type: String , required:true , unique:true , lowercase:true},
    email:{type: String , required:true , unique:true , lowercase:true}, 
    password:{type: String , required:true },
    number:{type: Number , required:true , unique:true},
    category:{type: String , required:true },
    country:{type: String , required:true },
    practice:{type: Number , required:true },
    gradz:{type: Date , required:true },
    workS:{type: String , required:true },
    workE:{type: String , required:true },
    locationArea:{type:String , required:true},
    image:{type:String  , default:"NoImage.png"},
    certificate:{type:String , default:"NoImageCER.png"},
    rating:{type:Array },
    ratingUsers:{type:Array },
    

    comments:{type:Array}
    
});

Doctor.methods.encryptPassword = function (password) {
    return bcrypt.hashSync(password , bcrypt.genSaltSync(10),null);
  };

  module.exports = mongoose.model("Doctor" , Doctor);