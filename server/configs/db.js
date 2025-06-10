import mongoose from "mongoose";

const connectDB = async () => {
    try{
        mongoose.connection.on('connected', () => console.log("Database Conneted")
    );
    await mongoose.connect(`${process.env.MONGODB_URI}/grocery`)
    } catch (error) {
        console.error(error.message,"db connection failed");
    }
}

export default connectDB;