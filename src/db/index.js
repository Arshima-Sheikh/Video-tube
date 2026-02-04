import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDb=async()=>{
    try{
       const connectionInstance= await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       console.log(`connected to mondodb, connection instance is ${connectionInstance.connection.host} `)
    }
    catch(error){
        console.log("mongo db connection error "+error)
        process.exit(1)
    }
}

export default connectDb