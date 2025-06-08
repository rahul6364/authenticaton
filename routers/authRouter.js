const express=require("express");
const authController=require("../controllers/authController.js")
const router=express.Router();

router.post('/signup',authController.signup)
router.post('/signin',authController.signin)
router.post('/signout',authController.signout)
router.patch('/sendVerficationCode',authController.sendVerficationCode)

module.exports=router;