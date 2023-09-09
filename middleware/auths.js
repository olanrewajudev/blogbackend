const jwt = require('jsonwebtoken')

exports.UserRoutes = async (req, res, next) => {
    try {
        // Bearer 58yu0595309tj39t34t934t-9j-39-9t
        const tokenHeader = req.headers.authorization
        if (!tokenHeader) return res.status(403).send(`Forbidden: Access Denied`)
        const token = tokenHeader.split(' ')[1]
        if (!token) return res.json({ status: 403, msg: `Forbidden: Invalid Access` })
        const verified = jwt.verify(token, process.env.JWT_SECRET)
        if (!verified) return res.json({ status: 404, msg: `Access Denied: Session Expired` })
        if (verified.role !== 'user') return res.json({ status: 400, msg: `You cannot access this route` })
        req.user = verified.id
        next()
    } catch (error) {
        return res.json({ status: 400, msg: `Error ${error}` })
    }
}