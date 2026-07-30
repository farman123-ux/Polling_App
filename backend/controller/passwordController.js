import User from "../model/User.js"
import { generatOtp, optValid, otpExpiry } from "../utils/otp.js"
import { sendOtpEmail } from "../config/mailer.js"

export const forgetPassword = async(req,res)=>{
    try {
        const { email } = req.body
        const user = await User.findOne({ email })
        if(!user) return res.status(404).json({
            message : "No account with this email"
        })

        user.otp = generatOtp()
        user.otpExpires = otpExpiry()
        await user.save()
        await sendOtpEmail(user.email, user.otp, "Reset your account password")
        res.json({
            message :"OTP sent to your email"
        })
    } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// to check the otp is valiid 

export const verifyReasetOtp = async(req,res)=>{
    try {
        const {email, otp }= req.body
        const user = await User.findOne({email})
        if(!user) return res.status(404).json({
            message : " use not found"
        })
        if(!optValid(user, otp))return res.status(404).json({
            message : "Invalid or expires otp"
        })
        res.json({ ok : true})
    } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// to reset the password

export const resetPassword = async (req,res)=>{
    try {
        const {email,otp,password} = req.body
        if(!password || password.length < 8) 
            return res.status(404).json({
        message : "password must be alteast 8 charachter"})
         const user = await User.findOne({email})
        if(!user) return res.status(404).json({
            message : " use not found"
        })
        if(!optValid(user, otp))return res.status(404).json({
            message : "Invalid or expires otp"
        })

        user.password = password
        user.otp = undefined
        user.otpExpires = undefined
        user.isVerified = true
        await user.save()
        res.json({
            message : "password reaset successfully"
        })
    } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
