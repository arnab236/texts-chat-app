import mongoose from "mongoose";

// Function to connect to MongoDB
export const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("Mongoose connected to DB Cluster successfully");
    });
    await mongoose.connect(`${process.env.MONGODB_URI}/chat-app`);
    // console.log("MongoDB connected successfully");
  } catch (error) {
    console.log("Error connecting to MongoDB:", error);
    // process.exit(1);
  }
}