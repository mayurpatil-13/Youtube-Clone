import { db_name } from "../constants.js";
import mongoose from "mongoose";

const connectDB = async () =>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_CONNECTION_STRING}/${db_name}`);
        console.log("Mongodb connect with host ", connectionInstance.connection.host);
    } catch (error) {
        console.log("Mongodb connection failed ", error);
        process.exit(1);
    }
};

export default connectDB;