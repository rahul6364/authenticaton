const express=require("express");
const authController=require("../controllers/authController.js")
const identification=require("../middleware/ideantification.js")
const router=express.Router();

router.post('/signup',authController.signup)
router.post('/signin',authController.signin)
router.post('/signout',identification.identifier,authController.signout)
router.patch('/sendVerficationCode',identification.identifier,authController.sendVerficationCode)
router.patch('/verifysendVerficationCode',identification.identifier,authController.verifyVerificationCode)
router.patch('/changePassword',identification.identifier,authController.changePassword)

module.exports=router;