var mongoose   = require("mongoose");
var Schema     = mongoose.Schema ;
var bcrypt     = require("bcrypt-nodejs");



var UserSchema = new Schema({

    username:{type:String , required :true , unique:true ,lowercase:true },
    email:{type:String , required :true , unique:true , lowercase:true},
    password:{type:String, required :true , minlength:8},
    image:{type:String , ref:"Doctor" , default:null},
    isDoctor:{type:Boolean , default:false},
    DoctorID:{type:Schema.Types.ObjectId  ,ref:'Doctor' ,default:null}

  });



UserSchema.methods.encryptPassword = function (password) {
    return bcrypt.hashSync(password , bcrypt.genSaltSync (10) ,null);
  };

  UserSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password , this.password) ;
  
  };

module.exports = mongoose.model("User" , UserSchema);