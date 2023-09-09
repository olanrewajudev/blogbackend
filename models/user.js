
const mongoose = require('mongoose')
const UserSchema = new mongoose.Schema({
    fullname: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    image: {type: String, required: true},
    status: {type: String, required: true},
    verified: {type: Boolean, default: false},
    otp: {
        code: {type: String},
        expires: {type: Date},
        nums: {type: Number},
        trial: {type: Date}
    },
    role: {type: String, required: true, default: 'user'},
}, {
    timestamps: true
})

module.exports = mongoose.model('User', UserSchema)