var mongoose  = require("mongoose");
var Schema    = mongoose.Schema;



var Country = new Schema({
    name:{type:String , lowercase:true , required:true , unique:true}
});


module.exports = mongoose.model("Country" , Country);
