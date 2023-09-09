const Blog = require('../models/blog')
const User = require('../models/user')
const Comment = require('../models/comment')
const slug = require('slug')
const fs = require('fs')
const mongoose = require('mongoose')

exports.AddNewBlog = async (req, res) => {
    try {
        const { title, content } = req.body
        if (!title || !content) return res.json({ status: 400, msg: `Imcomplete Request` })

        const { image } = req.files
        if (!image) return res.json({ status: 400, msg: `Image required` })

        const date = new Date()
        const fileName = `blog_${date.getTime()}.png`
        const filePath = './public/blogs'
        if (!fs.existsSync(filePath)) {
            fs.mkdirSync(filePath)
        }

        const blogSlug = slug(title, '-')
        const newblog = { title: title, content, slug: blogSlug, image: fileName, user: req.user }
        await Blog.create(newblog)
        await image.mv(`${filePath}/${fileName}`)

        return res.json({ status: 200, msg: `Blog Published Successfully` })
    } catch (error) {
        return res.json({ status: 400, msg: `Error ${error}` })
    }
}

exports.AllMyBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({ user: req.user })
        // const blogarr = []
        // blogs.map((item) => {
        //     const data = {
        //         title: item.title,
        //         image: item.image,
        //         _id: item._id,
        //         createdAt: item.createdAt,
        //         author: item.user,
        //         slug: item.slug
        //     }

        //     blogarr.push(data)
        // })
        return res.json({ status: 200, msg: blogs })
    } catch (error) {
        return res.json({ status: 400, msg: `Error ${error}` })
    }
}

exports.SingleBlog = async (req, res) => {
    try {
        const { id } = req.params
        const blog = await Blog.findOne({ _id: id })
        if (!blog) return res.json({ status: 404, msg: `Blog not found` })

        return res.json({ status: 200, msg: blog })
    } catch (error) {
        return res.json({ status: 200, msg: `Error ${error}` })
    }
}

exports.UpdatesBlogPost = async (req, res) => {
    try {
        const { title, content, id } = req.body
        if (!title || !content || !id) return res.json({ status: 404, msg: `Incomplete blog details` })

        const blog = await Blog.findById(id)
        if (!blog) return res.json({ status: 404, msg: `Blog not found` })

        const filePath = './public/blogs'

        const image = !req.files?.image ? null : req.files.image
        if (image !== null) {
            // check if previous image still exists, if yes then delete it 
            const fileToDelete = `${filePath}/${blog.image}`
            if (fs.existsSync(fileToDelete)) {
                fs.unlinkSync(fileToDelete)
            }
            // make room to store the new file
            const date = new Date()
            const fileName = `blog_${date.getTime()}.png`
            await image.mv(`${filePath}/${fileName}`)
            blog.image = fileName
        } else {
            blog.image = blog.image
        }
        blog.title = title
        blog.content = content
        blog.slug = slug(title, '-')
        await blog.save()

        return res.json({ status: 200, msg: `${blog.title} Updated Successfully` })
    } catch (error) {
        return res.json({ status: 400, msg: `Error: ${error}` })
    }
}

exports.DeleteBlog = async (req, res) => {
    try {
        const { id } = req.body
        const blog = await Blog.findById(id)
        if (!blog) return res.json({ status: 404, msg: `Blog not found` })
        const filePath = `./public/blogs/${blog.image}`
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
        }
        await blog.deleteOne()

        return res.json({ status: 200, msg: `Blog Deleted` })
    } catch (error) {
        return res.json({ status: 400, msg: `Error: ${error}` })
    }
}

exports.AllNormalBlogs = async (req, res) => {
    try {
        const items = await Blog.find().sort({ createdAt: -1 }).populate('user')
        const coms = await Comment.find()
        const allitems = []
        items.map(blog => {
            const dataComs = coms.filter(single => single.blog.toString() === blog._id.toString())
            let data;
            if (dataComs.length > 0) {
                data = {
                    blog,
                    comments: dataComs
                }
            }else {
                data = {
                    blog: blog,
                    comments: []
                }
            }
            return allitems.push(data)

        })
        return res.json({ status: 200, msg: items, allitems })
    } catch (error) {
        return res.json({ status: 400, msg: `Error ${error}` })
    }
}

exports.HandleLikes = async (req, res) => {
    try {
        const { blogid, tag } = req.body
        const userid = req.user
        if (!blogid || !tag) return res.json({ status: 400, msg: `Incomplete information` })
        const blog = await Blog.findById(blogid)
        if (!blog) return res.json({ status: 404, msg: `Blog not found` })

        const checkdislike = blog.dislikes.find((item) => item.toString() === userid.toString())
        if (checkdislike) {
            const offDislike = blog.dislikes.filter(item => item.toString() !== userid.toString())
            blog.dislikes = offDislike
            await blog.save()
        }

        if (tag === 'like') {
            // user want to like the blog for the new time
            blog.likes.push(userid)
        } else {
            //unlike the user like
            const filtered = blog.likes.filter(item => item.toString() !== userid.toString())
            blog.likes = filtered
        }

        await blog.save()
        return res.json({ status: 200 })
    } catch (error) {
        return res.json({ status: 400, msg: `Error ${error}` })
    }
}

exports.HandleDisLikes = async (req, res) => {
    try {
        const { blogid, tag } = req.body
        const userid = req.user
        if (!blogid || !tag) return res.json({ status: 400, msg: `Incomplete information` })
        const blog = await Blog.findById(blogid)
        if (!blog) return res.json({ status: 404, msg: `Blog not found` })

        const checklike = blog.likes.find((item) => item.toString() === userid.toString())
        if (checklike) {
            const offLike = blog.likes.filter(item => item.toString() !== userid.toString())
            blog.likes = offLike
            await blog.save()
        }

        if (tag === 'dislike') {
            // user want to like the blog for the new time
            blog.dislikes.push(userid)
        } else {
            //unlike the user like
            const filtered = blog.dislikes.filter(item => item.toString() !== userid.toString())
            blog.dislikes = filtered
        }

        await blog.save()
        return res.json({ status: 200 })

    } catch (error) {
        return res.json({ status: 400, msg: `Error ${error}` })
    }
}
