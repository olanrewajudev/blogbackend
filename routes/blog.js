const { AddNewBlog, AllMyBlogs, SingleBlog, UpdatesBlogPost, DeleteBlog, AllNormalBlogs, HandleLikes, HandleDisLikes, HandleComment } = require('../controllers/blog')
const { UserRoutes } = require('../middleware/auths')

const router = require('express').Router()

router.post('/add-blog', UserRoutes, AddNewBlog)
router.get('/my-blogs', UserRoutes, AllMyBlogs)
router.get('/:id', SingleBlog)
router.post('/update-blog', UserRoutes, UpdatesBlogPost)
router.post('/delete-blog', UserRoutes, DeleteBlog)
router.get('/general/blogs', AllNormalBlogs)
router.post('/like', UserRoutes, HandleLikes)
router.post('/dislike', UserRoutes, HandleDisLikes)
module.exports = router 