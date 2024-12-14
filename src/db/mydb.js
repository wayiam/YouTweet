import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const Instance = await mongoose.connect(`${process.env.MONGODB_URL}`);
    console.log(Instance);
    console.log(`MongoDB connected! DB host: ${Instance.connection.host}`);
  } catch (error) {
    console.log("Error occured while connecting to the mongoose from mydb.js");
    process.exit(1);
  }
};

export default connectDB;
