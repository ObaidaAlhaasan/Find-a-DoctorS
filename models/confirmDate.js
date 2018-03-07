const mongoose  = require("mongoose");
const Schema    = mongoose.Schema ;

const ConfirmS  = new Schema({
DoctorID:{type:Schema.Types.ObjectId ,ref:"Doctor"},
users:[
    {name:{type:String,required:true},
    email:{type:String , required:true},
    number:{type:Number , required:true},
    userID:{type:Schema.Types.ObjectId , ref:"User"},
    WDate:{type:String ,required:true},
    timeS:{type:String,required:true},
    timeE:{type:String,required:true},
    description:{type:String,required:true},
    toDelete:{type:Boolean , default:false},
    Drname:{type:String}
    }
]
});


var Confirm = module.exports = mongoose.model("Confirm",ConfirmS);

