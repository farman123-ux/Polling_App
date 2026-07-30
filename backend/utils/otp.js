export const generatOtp = () => String(Math.floor(100000 + Math.random() * 900000))

export const otpExpiry = () => new Date(Date.now() + 10 * 60 * 1000)

export const optValid = (user, otp) =>
    user.otp === otp && user.otpExpires && user.otpExpires > new Date()