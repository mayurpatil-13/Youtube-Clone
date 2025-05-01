import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: './.env.local'
})

console.log(`ENV variables ${process.env.MONGODB_CONNECTION_STRING}`);

connectDB()
.then(()=>{
    app.on("error", (error) =>{
        console.log("Error after mongo connection" , error);
        throw error;
    })
    app.listen(process.env.PORT || 5000 , () =>{
        console.log("app is listening")
    })
})
.catch((err) => {
    console.log(`mongodb connection failed ${err}`);
})