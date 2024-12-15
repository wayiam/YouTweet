import mongoose from "mongoose";

const connectDB = async() => {
    try {
        const Instance = await mongoose.connect(`${process.env.MONGODB_URL}`);
    } catch (error) {
        console.log("Error occured while connecting to the mongoose from mydb.js");
        process.exit(1);
    }
};

export default connectDB;