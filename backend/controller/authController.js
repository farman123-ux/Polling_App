import User from "../model/User.js"
import Poll from "../model/Poll.js"
import Comment from "../model/Comment.js"
import { uploadToCloudinary } from "../config/cloudinary.js"
import { generatOtp, optValid, otpExpiry } from "../utils/otp.js"
import { sendOtpEmail } from "../config/mailer.js"
import jwt from 'jsonwebtoken'

const makeToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" })
const clean = (u) => ({
    _id: u._id,
    name: u.name,
    email: u.email,
    username: u.username,
    avatar: u.avatar,
    bio: u.bio
})

export const register = async (req, res) => {
    try {
        const { name, email, username, password } = req.body
        if (!name || !email || !username || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }

        const exists = await User.findOne({ $or: [{ email }, { username }] })
        if (exists) return res.status(400).json({
            message: "Email or username already taken"
        })

        let avatar = ""
        if (req.file) {
            try {
                avatar = await uploadToCloudinary(req.file.buffer)
            } catch (e) {
                console.warn("Avatar upload skipped: ", e.message)
            }
        }

        const otp = generatOtp()
        await User.create({
            name,
            email,
            username,
            password,
            avatar,
            otp,
            otpExpires: otpExpiry()
        })
        await sendOtpEmail(email, otp, "Verify your pollify account")
        res.status(200).json({
            needsVerification: true,
            email
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body
        const user = await User.findOne({ email })
        if (!user) return res.status(404).json({
            message: "User not found"
        })
        if (!user.isVerified && !optValid(user, otp))
            return res.status(400).json({ message: "invalid or expired OTP" })
        user.isVerified = true
        user.otp = undefined
        user.otpExpires = undefined
        await user.save()
        res.json({
            token: makeToken(user._id), user: clean(user)
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

export const resendOtp = async (req, res) => {
    try {
        const { email } = req.body
        const user = await User.findOne({ email })
        if (!user) return res.status(404).json({ message: "user not found" })
        user.otp = generatOtp()
        user.otpExpires = otpExpiry()
        await user.save()
        await sendOtpEmail(user.email, user.otp, "Verify your Pollify account")
        res.json({
            message: "OTP sent"
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" })
        }
        const user = await User.findOne({ email })
        if (!user) return res.status(401).json({ message: "Invalid credentials" })
        const isMatch = await user.matchPassword(password)
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" })
        if (!user.isVerified)
            return res.status(401).json({ message: "please verify your email first", needsVerification: true, email })
        res.json({
            token: makeToken(user._id), user: clean(user)
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

export const updateProfile = async (req, res) => {
    try {
        const { name, username, bio } = req.body;
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (username && username !== user.username) {
            const taken = await User.findOne({ username });
            if (taken) return res.status(400).json({ message: "Username already taken" });
            user.username = username;
        }
        if (name) user.name = name;
        if (bio !== undefined) user.bio = bio;
        if (req.file) {
            try { user.avatar = await uploadToCloudinary(req.file.buffer); }
            catch (e) { console.warn("Avatar upload skipped:", e.message); }
        }
        await user.save();
        res.json({ user: clean(user) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { currentpassword, newPassword } = req.body
        if (!newPassword || newPassword.length < 8)
            return res.status(400).json({
                message: "new password must be alteast 8 charachter"
            })
        const user = await User.findById(req.userId)
        if (!user) return res.status(404).json({
            message: "user not found"
        })
        if (!(await user.matchPassword(currentpassword)))
            return res.status(400).json({
                message: "current password is incorrect"
            })
        user.password = newPassword
        await user.save()
        res.json({
            message: "password update successfully"
        })
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export const deleteAccound = async (req, res) => {
    try {
        const id = req.userId
        const myPolls = await Poll.find({ creator: id }).select("_id")
        const pollIds = myPolls.map((p) => p._id)
        await Comment.deleteMany({ $or: [{ user: id }, { poll: { $in: pollIds } }] })

        await Poll.deleteMany({ creator: id })
        await Poll.updateMany({}, { $pull: { votes: { user: id } } })
        await User.findByIdAndDelete(id)
        res.json({
            message: "account deleted"
        })
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
        if (!user)
            return res.status(404).json({
                message: "user not found"
            })
        const [created, voted] = await Promise.all([
            Poll.countDocuments({ creator: user._id }),
            Poll.countDocuments({ "votes.user": user._id })
        ])
        res.json({
            user: clean(user),
            stats: {
                created,
                voted,
                bookmarked: user.bookmarks.length
            }
        })
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// to see who user follows and who follows him
export const getConnections = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username })
            .select("_id following")
            .populate("following", "name username avatar")
        if (!user)
            return res.status(404).json({
                message: "user not found"
            })
        const followers = await User.find({ following: user._id }).select(
            "name username avatar"
        )
        res.json({
            followers,
            following: user.following || []
        })
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}