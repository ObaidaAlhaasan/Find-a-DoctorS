var mongoose  = require("mongoose");
var Schema    = mongoose.Schema;
var User      = require("./users");
// user:{type:Schema.Types.ObjectId , ref:'User'},

var Post = new Schema({
    title:{type:String , required:true },
    date:{type:Date , default:Date.now()},
    user:{type:Schema.Types.ObjectId  ,ref:'User'},
    username:{type:String,required:true},
    post :{type:String, required:true},
    like:{type:Array,default:[String]},
    likes:{type:Number,default:0},
    dislike:{type:Array,default:[String]},
    dislikes:{type:Number , default:0},
    comments:{type:Array},
    comment:{type:Number , default:0}
});


Post.methods.increasLike = function () {  
    this.like[0].push("shadow") ;
};


module.exports = mongoose.model("Post" , Post);
