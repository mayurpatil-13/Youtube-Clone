import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
    path: './.env.local'
})

console.log(`ENV variables ${process.env.MONGODB_CONNECTION_STRING}`);

connectDB();