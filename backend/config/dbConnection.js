import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://fk160061_db_user:5wgn0gXaL66IfrWj@cluster0.jytbqvx.mongodb.net/pollify?retryWrites=true&w=majority";

export const connectdb = async () => {
  // If already connected, return
  if (mongoose.connection.readyState === 1) return;

  // If currently connecting, wait briefly for connection to establish
  if (mongoose.connection.readyState === 2) {
    let retries = 0;
    while (mongoose.connection.readyState === 2 && retries < 20) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      retries++;
    }
    if (mongoose.connection.readyState === 1) return;
  }

  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("DB connected successfully");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    if (err.name === 'MongooseServerSelectionError') {
      console.error("-> Ensure your IP address is whitelisted in MongoDB Atlas Network Access (https://cloud.mongodb.com).");
    }
    throw err;
  }
};
