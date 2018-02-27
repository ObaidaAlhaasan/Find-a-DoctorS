var mongoose = require("mongoose");
var Schema   = mongoose.Schema ;
var bcrypt   = require("bcrypt-nodejs");

/*
Born
national
university
About
                    */

var Doctor = new Schema({
    name:{type: String , required:true , unique:true , lowercase:true},
    national:{type:String , required: true},
    university:{type:String , required: true},
    About:{type:String , required: true},
    Born:{type:Date },
    
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
    ratingUsers:{type:Array  },

    comments:{type:Array,default:[{username:String , msg:String}]}

});

Doctor.methods.encryptPassword = function (password) {
    return bcrypt.hashSync(password , bcrypt.genSaltSync(10),null);
  };

  Doctor.methods.validPassword = function (password) {
    return bcrypt.compareSync(password , this.password) ;
  
  };

  
  module.exports = mongoose.model("Doctor" , Doctor);