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
  secret: process.env.SESSION_KEY,      // change this in production
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,                // true only if you're using HTTPS
    maxAge: 1000 * 60   // optional: 1 day
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
    // ✅ Get global siteDocs
    const siteDocs = await siteNames.find();
    console.log(siteDocs.siteName)
    const sites1 = {};
    siteDocs.forEach(doc => { sites1[doc.siteName] = doc.link; });

    // ✅ Get user-specific sites
    const sites = {};
    user1.sites.forEach(doc => {
        sites[doc.siteName] = doc.link;
    });

    // ✅ Merge both
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
// async function   insertSite(){
// const sitesArray = [
//     { siteName: "youtube", link: "https://www.youtube.com/results?search_query=" },
//     { siteName: "YouTube", link: "https://www.youtube.com/results?search_query=" },
//     { siteName: "google", link: "https://www.google.com/search?q=" },
//     { siteName: "Google", link: "https://www.google.com/search?q=" },
//     { siteName: "flipkart", link: "https://www.flipkart.com/search?q=" },
//     { siteName: "Flipkart", link: "https://www.flipkart.com/search?q=" },
//     { siteName: "whatsapp", link: "whatsapp://send?text=Hello" },
//     { siteName: "Whatsapp.", link: "whatsapp://send?text=Hello" },
//     { siteName: "gmail", link: "mailto:someone@example.com?subject=Hello&body=How are you?" },
//     { siteName: "word", link: "ms-word:ofe|u|file:///C:/Users/User/Documents/file.docx" },
//     { siteName: "excel", link: "ms-excel:ofe|u|file:///C:/Users/User/Documents/file.xlsx" },
//     { siteName: "powerpoint", link: "ms-powerpoint:ofe|u|file:///C:/Users/User/Documents/file.pptx" },
//     { siteName: "power point", link: "ms-powerpoint:ofe|u|file:///C:/Users/User/Documents/file.pptx" },
//     { siteName: "vscode", link: "vscode://" },
//     { siteName: "vs code", link: "vscode://" },
//     { siteName: "calendar", link: "outlookcal:" },
//     { siteName: "calculator", link: "calculator://" },
//     { siteName: "copilot", link: "ms-copilot://" },
//     { siteName: "settings", link: "ms-settings:" },
//     { siteName: "setting", link: "ms-settings:" },
//     { siteName: "command", link: "cmd:" },
//     { siteName: "cmd", link: "cmd:" },
//     { siteName: "CMD", link: "cmd:" },
//     { siteName: "command prompt", link: "cmd:" },
//     { siteName: "amazon", link: "https://www.amazon.in/s?k=" },
//     { siteName: "chatgpt", link: "https://chatgpt.com/" },
//     { siteName: "chat gpt", link: "https://chatgpt.com/" },
//     { siteName: "google classroom", link: "https://classroom.google.com/" },
//     { siteName: "classroom", link: "https://classroom.google.com/" }
// ];

// let add=await siteNames.insertMany(sitesArray)
// console.log(add)
// }
// insertSite();