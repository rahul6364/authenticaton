const { signupSchema } = require('../middleware/validator.js');
const userModel = require('../models/user.model.js');
const { doHash, hashValidation, hmacProcess } = require('../utils/hashing.js');
const jwt = require("jsonwebtoken")
const transport = require("../middleware/sendMail.js")


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

exports.signout = async (req, res) => {
    res.clearCookie('Authorization')
        .status(200)
        .json({
            success: true,
            message: "loggedout successfully"
        })
}



exports.sendVerficationCode = async (req, res) => {
    const { email } = req.body;
    try {
        const existingUser = await userModel.findOne({ email })

        if (existingUser.verified) {
            return res.status(400).json({
                success: false,
                message: "you are already verified"
            })
        }

        const codeValue = Math.floor(Math.random() * 1000000).toString();

        let info = await transport.sendMail({
            from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
            to: existingUser.email,
            subject: "verification code",
            html: '<h1>' + codeValue + '</h1>'
        })

        if (info.accepted[0] === existingUser.email) {
            const hashedCodeValue = hmacProcess(
                codeValue,
                process.env.HASHING_KEY)

            existingUser.verificationCode = hashedCodeValue;
            existingUser.verificationCodeValidation = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
            await existingUser.save();
            return res.status(200).json({
                success: true,
                message: "code sent!"
            })
        }



    } catch (error) {
        console.log(error);

    }
}

exports.verifyVerificationCode = async (req, res) => {
    const { email, providedCode } = req.body;
    try {
        const { error, value } = acceptCodeSchema.validate({ email, providedCode });
        if (error) {
            return res.status(401).json({
                success: false,
                message: error.details[0].message
            })
        }

        const existingUser = await userModel.findOne({ email }).select('+verificationCode+verificationCodeValidation')

        if (!existingUser) {
            return res
                .status(401)
                .json({
                    success: false,
                    message: "user doesnt found"
                })
        }

        if(existingUser.verified){
            return res.status(200).json({
                success: true,
                message: "code sent!"
            })
        }
        
    } catch (error) {
        console.log(error);

    }
}