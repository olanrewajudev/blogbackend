
const mongoose = require('mongoose')
const BlogSchema = new mongoose.Schema({
    title: {type: String, required: true},
    image: {type: String, required: true},
    slug: {type: String, required: true},
    content: {type: String, required: true},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    likes: [
        {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
    ],
    dislikes: [
        {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
    ]
}, {
    timestamps: true
})

const BlogModel = mongoose.model('Blog', BlogSchema)

module.exports = BlogModel