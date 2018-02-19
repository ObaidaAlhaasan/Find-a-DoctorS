var mongoose  = require("mongoose");
var Schema    = mongoose.Schema;



var Category = new Schema({
    name:{type:String , lowercase:true , required:true , unique:true}
});


module.exports = mongoose.model("Category" , Category);
