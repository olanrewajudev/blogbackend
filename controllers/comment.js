const Comment = require('../models/comment')
const Blog = require('../models/blog')
const User = require('../models/user')

const errors = (res, error) => {
    return res.json({status: 400, msg: 'something went wrong', response: error})
}

exports.AddComment = async (req, res) => {
    try {
        const {text, blogid} = req.body 
        if(!text || !blogid) return res.json({status: 400, msg: `Provide a valid comment`})
        const newComment = {text: text, blog: blogid, user: req.user}
        await Comment.create(newComment)

        return res.json({status: 200, msg: `Comment Saved`})
    } catch (error) {
        errors(res, error)
    }
}

exports.GetAllBlogComment = async (req, res) => {
    try {
        const {blogid} = req.params 
        const comments = await Comment.find({blog: blogid}).populate('user')
        return res.json({status: 200, msg: comments})
    } catch (error) {
        errors(res, error)
    }
}