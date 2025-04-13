const express=require("express");
const app=express();
const path=require("path");
const methodOverride=require("method-override")
app.use(methodOverride("_method"))

app.set("views",path.join(__dirname,"views"))
app.set("view engine","ejs")
const mongoose=require("mongoose");
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,"public")))
//connection to db
main().then(res=>{
    console.log("connection is okay")
}).catch(err=>{
    console.log("erro",err)
})
async function main(){
    mongoose.connect("mongodb://127.0.0.1:27017/signin")
}

const loginSchema= new mongoose.Schema({
    username:String,
    email:String,
    mobile:String,
    password:String, 
  
})
const login=mongoose.model("login",loginSchema)
app.get("/",(req,res)=>{
    res.render("login.ejs");
})
app.get("/signup",(req,res)=>{
    res.render("signup.ejs")
})
const port=4000;
app.listen(port,()=>{
    console.log("listening on port 4000")
})
// login.insertOne({username:"dongre",password:123})

app.post("/home",async(req,res)=>{
    const {username,password}=req.body;
 
    let user1 = await login.findOne({username:username,password:password});

 
if(user1){
    if(user1.username===username && user1.password===password){

        res.render("main.ejs",{user1})
        
     }
}

 else{
    res.send("username or password is wrong")

 }

})
app.post("/signin",async(req,res)=>{
    const {username, email,password,mobile}=req.body;
    let newUser= await login.insertOne({username:username,email:email,
        mobile:mobile,
        password:password,
       

    });

    if(newUser){
        res.render("login.ejs")
    }
    else{
        res.send("please login or signup first")
    }
})

const { exec } = require('child_process');


app.get('/open-cmd', (req, res) => {
    exec('start cmd.exe');
    res.send('Command Prompt opened!');
})



app.get('/open-explorer', (req, res) => {
    exec('start explorer.exe'); // Opens File Explorer
    res.send('File Explorer opened!');
});