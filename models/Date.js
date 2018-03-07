const mongoose  = require("mongoose");
const Schema    = mongoose.Schema ;

const NewDate  = new Schema({
DoctorID:{type:Schema.Types.ObjectId ,ref:"Doctor"},
count:{type:Number , default:0},
users:[
    {name:{type:String,required:true},
    email:{type:String , required:true},
    number:{type:Number , required:true},
    userID:{type:Schema.Types.ObjectId , ref:"User"},
    time_Date:{type:Date , default:Date.now()}
    }
]
});


var TDate = module.exports = mongoose.model("TDate",NewDate);

