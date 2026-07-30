import express from 'express'
import { upload } from '../config/cloudinary.js'
import { changePassword, deleteAccound, getMe, login, register, resendOtp, updateProfile, verifyOtp } from '../controller/authController.js'
import { forgetPassword, resetPassword, verifyReasetOtp } from '../controller/passwordController.js'
import { protect } from '../middleware/auth.js'

const authRouter = express.Router()

authRouter.post('/register', upload.single("image"), register)
authRouter.post('/verify-otp',verifyOtp)
authRouter.post('/resend-otp',resendOtp)

authRouter.post('/login',login)
authRouter.post('/forget-password',forgetPassword)
authRouter.post('/verify-reset-otp',verifyReasetOtp)

authRouter.post('/reset-password',resetPassword)
authRouter.get('/me',protect,getMe)

authRouter.patch('/profile', protect, upload.single("image"), updateProfile)
authRouter.patch('/password',protect,changePassword)
authRouter.delete('/account',protect,deleteAccound)

export default authRouter
