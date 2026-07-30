import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://murtazakamalkamalhussain_db_user:KRiq6uGoyFHIuF0e@cluster0.cumygyl.mongodb.net/Poll"

export const connectdb = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    })
    console.log("DB connected successfully")
  } catch (err) {
    console.error("MongoDB connection failed:", err.message)
    throw err
  }
}
