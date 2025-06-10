const { signupSchema, acceptCodeSchema,changePasswordSchema,acceptFP } = require('../middleware/validator.js');
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
        }, process.env.TOKEN_SECRET,

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
            html: '<h1>' + codeValue + '</h1>',
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

        const existingUser = await userModel.findOne({ email }).select('+verificationCode +verificationCodeValidation')

        if (!existingUser) {
            return res
                .status(401)
                .json({
                    success: false,
                    message: "user doesn't found"
                })
        }

        // console.log(existingUser);
        // console.log(existingUser.verificationCode);
        // console.log(existingUser.verificationCodeValidation);


        if (existingUser.verified) {
            return res.status(200).json({
                success: false,
                message: "you are already verified!"
            })
        }

        if (!existingUser.verificationCode || !existingUser.verificationCodeValidation) {
            return res.status(400).json({
                success: false,
                message: "something went wrong in verification code"
            })
        }

        if (Date.now() > existingUser.verificationCodeValidation) {
            return res.status(200).json({
                success: false,
                message: "code is expired"
            })
        }

        const hashedCodeValue = hmacProcess(providedCode.toString(), process.env.HASHING_KEY)

        if (hashedCodeValue === existingUser.verificationCode) {
            existingUser.verified = true;
            existingUser.verificationCode = undefined
            existingUser.verificationCodeValidation = undefined

            await existingUser.save()
            return res
                .status(200)
                .json({
                    success: true,
                    message: "your account has been verified"
                })
        }
        return res
            .status(400)
            .json({
                success: false,
                message: "unexpected error "
            })



    } catch (error) {
        console.log(error);

    }
}


exports.changePassword = async (req, res) => {
    const { userId, verified } = req.user;  // make sure req.user is set

    const { oldPassword, newPassword } = req.body

    try {
  
        const {error,value}=changePasswordSchema.validate({oldPassword,newPassword})
        if (error) {
            return res.status(401).json({
                success: false,
                message: error.details[0].message
            })
        }
        // if (!verified) {
        //     return res.status(404).json({
        //         success: false,
        //         message: "user is not verified"
        //     })
        // }
        const existingUser = await userModel.findOne({_id:userId }).select('+password')
        if (!existingUser) {
            return res.status(401).json({
                success: false,
                message: "user not found"
            })
        }

        const result = await hashValidation(oldPassword, existingUser.password)
       if (!result) {
            return res.status(401).json({
                success: false,
                message: "incorrect password"
            })
        }
        const hashedPassword=await doHash(newPassword,12)

        existingUser.password=hashedPassword;
        await existingUser.save();

         return res
            .status(200)
            .json({
                success: true,
                message: "Password is changed"
            })
        


    } catch (error) {

        console.log(error);

    }
}


exports.sendForgotPasswordCode = async (req, res) => {
    const { email } = req.body;
    try {
        const existingUser = await userModel.findOne({ email })
        if (!existingUser) {
            return res
                .status(401)
                .json({
                    success: false,
                    message: "user doesn't found"
                })
        }

        const codeValue = Math.floor(Math.random() * 1000000).toString();

        let info = await transport.sendMail({
            from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
            to: existingUser.email,
            subject: "ForgotPassword code",
            html: '<h1>' + codeValue + '</h1>',
        })

        if (info.accepted[0] === existingUser.email) {
            const hashedCodeValue = hmacProcess(
                codeValue,
                process.env.HASHING_KEY)

            existingUser.forgotPasswordCode = hashedCodeValue;
            existingUser.forgotPasswordCodeValidation = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
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

exports.verifyForgotPasswordCode = async (req, res) => {
    const { email, providedCode,newPassword } = req.body;
    try {
        const { error, value } = acceptFP.validate({ email, providedCode,newPassword });
        if (error) {
            return res.status(401).json({
                success: false,
                message: error.details[0].message
            })
        }

        const existingUser = await userModel.findOne({ email }).select('+forgotPasswordCode +forgotPasswordCodeValidation')

        if (!existingUser) {
            return res
                .status(401)
                .json({
                    success: false,
                    message: "user doesn't found"
                })
        }

        if (!existingUser.forgotPasswordCode || !existingUser.forgotPasswordCodeValidation) {
            return res.status(400).json({
                success: false,
                message: "something went wrong in verification code"
            })
        }

        if (Date.now() > existingUser.forgotPasswordCodeValidation) {
            return res.status(200).json({
                success: false,
                message: "code is expired"
            })
        }

        const hashedCodeValue = hmacProcess(providedCode.toString(), process.env.HASHING_KEY)

        if (hashedCodeValue === existingUser.forgotPasswordCode) {
            existingUser.verified = true;
            existingUser.forgotPasswordCode = undefined
            existingUser.forgotPasswordCodeValidation = undefined


        const hashedPassword=await doHash(newPassword,12)

        existingUser.password=hashedPassword;
        await existingUser.save();

         return res
            .status(200)
            .json({
                success: true,
                message: "Password is changed"
            })
            
        }
      return res
            .status(200)
            .json({
                success: true,
                message: "Password is changed"
            })



    } catch (error) {
        console.log(error);

    }
}