const express=require("express");
const dotenv=require("dotenv").config();
const cors=require("cors");
const helmet=require("helmet");
const cookieParser=require("cookie-parser");
const mongoose=require("mongoose");
const router=require("./routers/authRouter.js")
// const 

const port=process.env.PORT
const app= express();

mongoose.connect(process.env.MONGODB_URI)
.then(()=>{
    
    console.log("db is connected");
    })
.catch((err)=>{
    console.error("db is not connected",err);
})
app.use(express.json())
app.use("/api/auth",router);
app.use(cors());
app.use(helmet());
app.use(cookieParser());



app.get('/api',(req,res)=>{
    res.json("Hello from the server!");
});


app.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`);
});