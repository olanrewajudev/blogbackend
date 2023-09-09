const mongoose = require('mongoose')

const CommentSchema = new mongoose.Schema({
    text: {type: String},
    blog: {type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
}, {timestamps: true}) 

const CommentModel = mongoose.model('Comment', CommentSchema)
module.exports = CommentModel