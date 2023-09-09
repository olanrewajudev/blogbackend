const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const fileUpload = require('express-fileupload')

require('dotenv').config()

const app = express()
const port = process.env.PORT || 5001
const uri = process.env.MONGO_URI 

const connector = mongoose.connect(uri)
if(connector) {
    console.log('Mongodb connected')
}

app.use(cors())
app.use(express.json())
app.use(fileUpload())
app.use(express.static('public'))
app.use('/api/user', require('./routes/user'))
app.use('/api/blog', require('./routes/blog'))
app.use('/api/comment', require('./routes/comment'))

app.listen(port, () => console.log(`Server running on http://localhost:${port}`))