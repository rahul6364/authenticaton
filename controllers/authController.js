const { signupSchema } = require('../middleware/validator.js');
const userModel = require('../models/user.model.js');
const { doHash, hashValidation } = require('../utils/hashing.js');
const jwt = require("jsonwebtoken")
exports.signup = async (req, res) => {
    const { email, password } = req.body;
    try {
        const { error, value } = signupSchema.validate({ email, password });
        if (error) {
            return res.status(401)
                .json({
                    success: false,
                    message: error.details[0].message,
                    details: error.de
                })
        }
        const existingUser = await userModel.findOne({ email })

        if (existingUser) {
            return res.status(401)
                .json({
                    success: false,
                    message: "user is already exist"
                })
        }

        const hashedPassword = await doHash(password, 12)

        const newUser = new userModel({
            email,
            password: hashedPassword
        })

        const result = await newUser.save()

        result.password = undefined
        res.status(201).json({
            success: true,
            message: "your account has been created",
            result
        })


    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "internal server error"
        })
    }
}




exports.signin = async (req, res) => {
    const { email, password } = req.body;

    try {

        const { error, value } = signupSchema.validate({ email, password });
        if (error) {
            return res.status(401).json({
                success: false,
                message: error.details[0].message
            })
        }


        const existingUser = await userModel.findOne({ email }).select('+password')

        if (!existingUser) {
            return res.status(401).json({
                success: false,
                message: "user not found"
            })
        }

        const result = await hashValidation(password, existingUser.password)
        if (!result) {
            return res.status(401).json({
                success: false,
                message: "incorrect password"
            })
        }

        const token = jwt.sign({
            userId: existingUser._id,
            email: existingUser.email,
            verified: existingUser.verified
        }, process.env.TOKEN_SECRETE,

            {
                expiresIn: '8h'
            }
        )
        res.cookie('Authorization', 'Bearer', +token,
            {
                expires: new Date(Date.now() + 8 * 3600000),
                httpOnly: process.env.NODE_ENV === 'production',
                secure: process.env.NODE_ENV === 'production'
            }).json({
                success: true,
                token,
                message: "logged in succesfully"
            })
    } catch (error) {
        console.log(error);

    }
}

exports.signout=async(req,res)=>{
    res.clearCookie('Authorization')
    .status(200)
    .json({
        success:true,
        message:"loggedout successfully"
    })
}




