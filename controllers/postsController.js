
const { createPostSchema } = require('../middleware/validator.js')

const Post = require('../models/posts.model')
const user = require('../models/user.model')


exports.getPosts = async (req, res) => {
    const { page } = req.query
    const postPerPage = 10
    try {
        if (page <= 1) {
            pageNum = 0
        } else {
            pageNum = page - 1
        }
        const result = await Post.find().sort({ createdAt: -1 }).skip(pageNum * postPerPage).limit(postPerPage).populate({
            path: 'userId',
            select: 'email',
        })

        res.status(200).json({ success: true, message: 'posts', data: result })
    } catch (error) {
        console.log(error);

    }
}

exports.singlePost = async (req, res) => {
    const { _id } = req.query

    try {
        const result = await Post.find({ _id }).populate({
            path: 'userId',
            select: 'email',
        })
        if (!result) {
            res.status(400)
                .json({
                    success: false,
                    message: 'post is not fount'
                })
        }

        res.status(200)
            .json({
                success: true,
                message: 'single-post', 
                data: result
            })
    } catch (error) {
        console.log(error);

    }
}

exports.createPost = async (req, res) => {
    const { title, descriptions } = req.body;

    const { userId } = req.user;

    try {

        const { error, value } = createPostSchema.validate({ title, descriptions, userId });
        if (error) {
            return res.status(401)
                .json({
                    success: false,
                    message: error.details[0].message,
                    details: error.de
                })
        }

        const result = await Post.create({
            title, descriptions, userId
        })

        res.status(200).json({ success: true, message: 'created', data: result })

    } catch (error) {
        console.log(error);

    }
}


exports.updatePost = async (req, res) => {
    const {_id}=req.query;
    const { title, descriptions } = req.body;

    const { userId } = req.user;

    try {

        const { error, value } = createPostSchema.validate({ title, descriptions, userId });
        if (error) {
            return res.status(401)
                .json({
                    success: false,
                    message: error.details[0].message,
                    details: error.de
                })
        }

        const existingPost = await Post.findOne({ _id })
        if (!existingPost) {
            res.status(400)
                .json({
                    success: false,
                    message: 'post is not fount'
                })
        }


        if(existingPost.userId.toString()!==userId){
             res.status(400)
                .json({
                    success: false,
                    message: 'unauthorized'
                })
        }
        existingPost.title=title;
        existingPost.descriptions=descriptions;
        
        const result = await existingPost.save()

        res.status(200).json({ success: true, message: 'updated', data: result })

    } catch (error) {
        console.log(error);

    }
}  

exports.deletePost = async (req, res) => {
    const {_id}=req.query;

    const { userId } = req.user;

    try {
        const existingPost = await Post.findOne({ _id })
        if (!existingPost) {
            res.status(400)
                .json({
                    success: false,
                    message: 'post is not fount'
                })
        }

        if(existingPost.userId.toString() !==userId){
            res.status(400)
                .json({
                    success: false,
                    message: 'user is unauthorized'
                })
        }
        // existingPost.

        await Post.deleteOne({_id})

        res.status(200).json({ success: true, message: 'post is deleted' })

    } catch (error) {
        console.log(error);

    }
}