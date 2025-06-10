const express=require("express");
const dotenv=require("dotenv").config();
const cors=require("cors");
const helmet=require("helmet");
const cookieParser=require("cookie-parser");
const mongoose=require("mongoose");
const authRouter=require("./routers/authRouter.js")
const postsRouter=require("./routers/newRouter.js")
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
app.use(express.urlencoded({extended:true}))

app.use(cors());
app.use(helmet());
app.use(cookieParser());

app.use("/api/auth",authRouter);
app.use("/api/posts",postsRouter)

app.get('/api',(req,res)=>{
    res.json("Hello from the server!");
});
app.get('/api/posts',(req,res)=>{
    res.json("Hello from the server!");
});


app.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`);
});