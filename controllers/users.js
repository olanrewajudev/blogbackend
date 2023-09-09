const User = require('../models/user')
const bcrypt = require('bcrypt')
const fs = require('fs')
const jwt = require('jsonwebtoken')
const MailSender  = require('../config/mailConfig')
const GenerateOtp = require('otp-generator')
const moment = require('moment')

exports.CreateAccount = async (req, res) => {
    try {
        const {fullname, email, password, confirm_password} = req.body 
        if(!fullname || !email || !password || !confirm_password) return res.json({status: 400, msg: `Incomplete Request detected`})
        if(password.length <6) return res.json({status: 400, msg: `Password must be at least 6 characters`})
        if(confirm_password !== password) return res.json({status: 400, msg: `Password(s) do not match`})

        const getSalt = await bcrypt.genSalt(15)
        const newpass = await bcrypt.hash(password, getSalt)

        // find if email already exists 
        const findEmail = await User.findOne({email: email})
        if(findEmail) return res.json({status: 400, msg: `Email Adress already exists`})


        const {image} = req.files
        if(!image) return res.json({status: 404, msg: `Profile Image is required`})

        const imagepath = './public/profile'
        if(!fs.existsSync(imagepath)) {
            fs.mkdirSync(imagepath)
        }

        const date = new Date()
        const imagename = `${fullname.slice(-3)}_${date.getTime()}.png`
        image.mv(`${imagepath}/${imagename}`, (err) => {
            if(err) return res.json({status: 400, msg: err})
        })

        const otpCode = GenerateOtp.generate(6, {specialChars: false, lowerCaseAlphabets: false})
        const timer = moment().add(1, 'minutes')

        const otp = {
            code: otpCode,
            expires: timer,
            nums: 1
        }

        const newuser = {fullname, email, password: newpass, image: imagename, otp: otp, status: 'online', role: 'user'}
        await User.create(newuser)

        await MailSender(email, `This is your OTP Verification code <h1>${otpCode}</h1>`, 'Account Verification OTP')

        return res.json({status: 200})
    } catch (error) {
        return res.json({status: 400, msg: `Error ${error}`})
    }
}

exports.ResendOTP = async (req, res) => {
    try {
        const {email} = req.body 
        if(!email) return res.json({status: 404, msg: `No Email Found`})
        const user = await User.findOne({email: email})
        if(!user) return res.json({status: 404, msg: `User doe not exists`})

        if(user.otp.nums === 3) {
            user.otp.trial = moment().add(1, 'days')
            return res.json({status: 400, msg: `You cannot recieve mail again, retry again in the next 24 hours`})
        }

        const otpCode = GenerateOtp.generate(6, {specialChars: false, lowerCaseAlphabets: false})
        const timer = moment().add(1, 'minutes')

        const otp = {
            code: otpCode,
            expires: timer,
            nums: user.otp.nums + 1
        }

        user.otp = otp
        await user.save()

        await MailSender(email, `This is your OTP Verification code <h1>${otpCode}</h1>`, 'Resend: Account Verification OTP')


        return res.json({status: 200, msg: `Mail sent successfully`})
    } catch (error) {
        return res.json({status: 400, msg: `Something went wrong`, response: `${error}`})
    }
}

exports.ValidateAccountWithOtp = async (req, res) => {
    try {
        const {code, email} = req.body 
        if(!code) return res.json({status: 400, msg: `Provide a valid verification code`})
        const user = await User.findOne({email: email})
        if(!user) return res.json({status: 404, msg: `Invalid Account`})
        if(user.otp.code !== code) return res.json({status: 400, msg: `Invalid verification code`})
        if(moment().isAfter(user.otp.expires)) return res.json({status: 400, msg: `OTP Expired!..`})

        user.verified = true
        user.otp.code = null
        user.otp.expires = null 
        await user.save()


        const token = jwt.sign({id: user._id, role: user.role}, process.env.JWT_SECRET, {expiresIn: '1d'})

        return res.json({status: 200, msg: `Account Created successfully`, token})
    } catch (error) {
        return res.json({status: 400, msg: `something went wrong`, response: `${error}`})
    }
}

exports.LoginAccount = async (req, res) => {
    try {
        const {email, password} = req.body 
        if(!email) return res.json({status: 404, msg: `Email address is required`})
        if(!password) return res.json({status: 404, msg: `Password is required`})

        const user = await User.findOne({email: email})
        if(!user) return res.json({status: 404, msg: `Email address does not exists!..`})
        const checkpassword = await bcrypt.compare(password, user.password)
        if(!checkpassword) return res.json({status: 404, msg: `Wrong password detected!..`})

        const token = jwt.sign({id: user._id, role: user.role}, process.env.JWT_SECRET, {expiresIn: '1d'})

        return res.json({status: 200, msg: `Logged in successfully`, token})
    } catch (error) {
        return res.json({status: 400, msg: `Error: ${error}`})
    }
}
 exports.GetAccountInfo = async (req, res) => {
    try {
        const user = await User.findById(req.user)
        if(!user) return res.json({status: 404, msg: `User not found`})

        return res.json({status: 200, msg: user})
    } catch (error) {
        return res.json({status: 400, msg: `Error: ${error}`})
    }
 }

 exports.LogoutAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user)
        if(!user) return res.json({status: 404, msg: `User not found`})

        user.status = 'offline'
        await user.save()
        const token = jwt.sign({id: user._id, role: 'user'}, process.env.JWT_SECRET, {expiresIn: '0s'})
        return res.json({status: 200, msg: `Logged Out`})
    } catch (error) {
        return res.json({status: 400, msg: `Error ${error}`})
    }
 }

 exports.sendMailToUser = async (req, res) => {
    try {
        await MailSender('ceasertech619@gmail.com', 'this is ola web site message from nodemailer', 'Testing Mail')
        return res.json({status: 200, msg: 'email sent successfully'})
    } catch (error) {
        return res.json({status: 400, msg: `a problem occured while recieving your request, please try again later`, response: `Error: ${error}`})
    }
 }