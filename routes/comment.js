const { AddComment, GetAllBlogComment } = require('../controllers/comment')
const { UserRoutes } = require('../middleware/auths')

const router = require('express').Router()


router.post('/add-comment', UserRoutes, AddComment)
router.get('/blog-comments/:blogid', GetAllBlogComment)

module.exports = router