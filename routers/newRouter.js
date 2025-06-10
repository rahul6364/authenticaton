const express=require("express");
const postsController=require("../controllers/postsController.js")
const identification=require("../middleware/ideantification.js")
const router=express.Router();

router.get('/all-post',postsController.getPosts)
router.get('/singlePost',postsController.singlePost)
router.post('/create-post',identification.identifier,postsController.createPost)
router.put('/updatePost',identification.identifier,postsController.updatePost)
router.delete('/deletePost',identification.identifier,postsController.deletePost)

module.exports=router