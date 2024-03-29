import dotenv from "dotenv";
import connectDB from "./db/index.js";

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
