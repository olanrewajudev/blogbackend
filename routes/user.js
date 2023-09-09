const { CreateAccount, LoginAccount, GetAccountInfo, LogoutAccount, sendMailToUser, ResendOTP, ValidateAccountWithOtp } = require('../controllers/users')
const { UserRoutes } = require('../middleware/auths')

const router = require('express').Router()

router.post('/register', CreateAccount)
router.post('/user-login', LoginAccount)
router.get('/get-account', UserRoutes, GetAccountInfo)
router.post('/logout-account', UserRoutes, LogoutAccount)
router.post('/resend-otp', ResendOTP)
router.post('/activate-registration', ValidateAccountWithOtp)
router.get('/send-mail', sendMailToUser) 


module.exports = router