const { string, required, number } = require("joi");
const mongoose=require("mongoose");

const userSchema=mongoose.Schema({
    email:{
        type:String,
        required:[true,"email is required"],
        trim:true,
        unique:[true,"email must be unique"],
        minLength:[5,"email must have 5 character"],
        lowercase:true
    },
    password:{
        type:String,
        required:[true,"password must be required"],
        trim:true,
        select:false
    },
    aadharNumber:{
        type:String,
        required:[true,"aadhar is required"],
        trim:true,
        unique:[true,"enter the proper aadhar numbe"],
        minLength:[12,"must have 12 digits"]
    },
    verified:{
        type:Boolean,
        default:false
    },
    verificationCode:{
        type:String,
        select:false
    },
    verificationCodeValidation:{
        type:Number,
        select:false
    },
    forgotPasswordCode:{
        type:String,
        select:false
    },
    forgotPasswordCodeValidation:{
        type:Number,
        select:false
    }
},
{
    timestamps:true
})

const userModel=mongoose.model('User',userSchema)

module.exports= userModel;