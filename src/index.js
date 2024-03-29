import dotenv from "dotenv";
import connectDB from "./db/index.js";
import cookieParser from "cookie-parser";
import cors from 'cors'

dotenv.config({
  path: "./env",
});

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, (req,res)=>{
        console.log(`Server is running at ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.error(`Mongodb Connection falied:`, err)
})
