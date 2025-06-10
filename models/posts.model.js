const { required } = require("joi");
const mongoose=require("mongoose");

const postSchema=mongoose.Schema({
    title:{
        type:String,
        required:[true,"title is required"],
        trim:true
    },
    descriptions:{
        type:String,
        required:[true,"descriptions is required"],
        trim:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'auth'
    }
},{
    timestamp:true
})

module.exports=mongoose.model('Post',postSchema);
    