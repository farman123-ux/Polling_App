import mongoose from "mongoose";
import bcrypts from 'bcryptjs'

const userSchema = new mongoose.Schema({
    name:{
        type : String,
        required : true,
        trim : true
    },
    email: {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true
    },
    username:{
        type : String,
        required : true,
        unique : true,
        trim : true
    },
    password : {
        type : String,
        required : true,
        minlength : 8
    },
    avatar : {
        type : String,
        default : ""
    },
    bio : {
        type : String,
        default : "",
        maxlength : 160
    },
    bookmarks : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Poll"
    }],
    following : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }],
    isVerified :{
        type : Boolean,
        default : false
    },
    otp: {
        type: String,
    },
    otpExpires: {
        type: Date,
    },
}, {
    timestamps : true
})

userSchema.pre('save', async function () {
    if (!this.isModified("password")) return 
    this.password = await bcrypts.hash(this.password, 10)
    
})

userSchema.methods.matchPassword = function (plain) {
    return bcrypts.compare(plain, this.password)
}

export default mongoose.model("User", userSchema)
