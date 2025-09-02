const express=require("express");
const app=express();
const path=require("path");
const methodOverride=require("method-override")
app.use(methodOverride("_method"))
require('dotenv').config();
const session = require("express-session");

const bcrypt = require('bcrypt'); 

app.use(express.static("public"));

app.use(session({
  secret: process.env.SESSION_KEY,     
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,                
    maxAge: 1000 * 60   
  }
}));
function isAuthenticated(req, res, next) {
    if (!req.session.userId) {
        console.log(req.session.userId)
        return res.redirect("/");
    }
    next();
}

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
async function main() {
    await mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    console.log("MongoDB Atlas connected!");
}

main().catch(err => console.log(err));

const loginSchema= new mongoose.Schema({
    username:String,
    email:String,
    mobile:String,
    password:String, 
     sites: [
        {
            siteName: String,
            link: String
        }
    ]
  
})
const siteSchema=new mongoose.Schema({
     siteName:String, 
     link:String 
    })


const siteNames=mongoose.model("siteNames",siteSchema)
const login=mongoose.model("login",loginSchema)

app.get("/",(req,res)=>{
    res.render("login.ejs");
})
app.get("/signup",(req,res)=>{
    res.render("signup.ejs")
})




app.post("/home", async (req, res) => {
    const { username, password } = req.body;

    let user1 = await login.findOne({ username: username });
  
    if (!user1) {
        return res.send("username or password is wrong");
    }

    const isMatch = await bcrypt.compare(password, user1.password);
    if (!isMatch) {
        return res.send("username or password is wrong");
    }
    req.session.userId = user1._id
    
    const siteDocs = await siteNames.find();
    console.log(siteDocs.siteName)
    const sites1 = {};
    siteDocs.forEach(doc => { sites1[doc.siteName] = doc.link; });

  
    const sites = {};
    user1.sites.forEach(doc => {
        sites[doc.siteName] = doc.link;
    });

 
    Object.assign(sites, sites1);

    res.render("main.ejs", { user1, sites });
});
app.post("/signin",async(req,res)=>{
    const {username, email,password,mobile}=req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
    let newUser= new login({username:username,email:email,
        mobile:mobile,
        password:hashedPassword
       

    });
    await newUser.save();

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








app.post("/addLink",isAuthenticated,async(req,res)=>{
    const {siteName,link}=req.body;
    console.log(siteName,link);
     const _id = req.session.userId; 
     console.log( req.session.userId)
   let done= await login.findByIdAndUpdate(_id,{$push:{sites:{siteName,link}}},{new:true})

 console.log(done)
    res.redirect("/")

})

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) console.log(err);
        res.redirect("/");
    });
});
const port=4000;
app.listen(port,()=>{
    console.log("listening on port 4000")
  });
// 
