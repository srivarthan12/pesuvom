import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser";
import { connectDB } from "./src/lib/db.js";
import cors from "cors"

import path from "path";


dotenv.config()
import {app,server} from "./src/lib/socket.js"
import authRoutes from "./src/routes/auth.route.js"
import messageRoutes from "./src/routes/message.route.js"


const PORT =process.env.PORT
const __dirname = path.resolve();

app.use(express.json({ limit: '10mb' }))
app.use(cookieParser())
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}));


app.use("/api/auth",authRoutes)
app.use("/api/messages",messageRoutes)

if(process.env.NODE_ENV==="PRODUCTION"){
    app.use(express.static(Path.join(__dirname,"../frontend/dist")))
    app.get("*",(req,res)=>{
        res.sendFile(path.join(__dirname,"../frontend","dist","index.html"))
    })
}


server.listen(5001,()=>{
    console.log(`server is running in port ${PORT}`)
    connectDB()
})