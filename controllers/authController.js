const {signupSchema}=require('../middleware/validator.js');
const userModel = require('../models/user.model.js');
const { doHash } = require('../utils/hashing.js');

exports.signup=async (req,res)=>{
    const {email,password,aadharNumber}=req.body;
   try{
    const {error,value}=signupSchema.validate({email,password,aadharNumber});
    if(error){
        return res.status(401)
        .json({
            success:false,
            message:error.details[0].message,
            details:error.de
        })
    }
    const existingUser=await userModel.findOne({email})

    if(existingUser){
        return res.status(401)
        .json({
            success:false,
            message:"user is already exist"
        })
    }

    const hashedPassword=await doHash(password,12)

    const existingaadhar=await userModel.findOne({aadharNumber})

    if(existingaadhar){
        return res.status(401)
        .json({
            success:false,
            message:"this aadhar number is already exist"
        })
    }
    const newUser=new userModel({
        email,
        password:hashedPassword,
        aadharNumber
    })

    const result=await newUser.save()

    result.password=undefined
    res.status(201).json({
        success:true,
        message:"your account has been created",
        result
    })

    
}catch(error){
console.log(error);
    res.status(500).json({
        success:false,
        message:"internal server error"
    })
}
}





