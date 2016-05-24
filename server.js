var express = require("express"),
    dotenv = require("dotenv"),
      path = require("path"),
      session = require("express-session"),
      bodyParser = require("body-parser"),
      passport = require("passport"),
      mongoose = require("mongoose"),
      routes = require(process.cwd() + "/app/routes");

dotenv.load();
    
var app = express();

require(process.cwd() + "/app/config/passport.js")(passport);

//db connection 
var db = mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/voteApp");

//middleware
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(session({
    secret: "Jintao is the best",
    resave: false,
    saveUninitialized :true  
}));
app.use(passport.initialize());
app.use(passport.session());
app.use("/controllers", express.static(process.cwd() + "/app/controllers"));
app.use("/node_modules", express.static(process.cwd() + "/node_modules"));
app.use("/public", express.static(process.cwd() + "/public"));
app.use("/common", express.static(process.cwd() + "/app/common"));
app.use("/node_modules", express.static(process.cwd() + '/node_modules'));
//routes

routes(app, passport);


app.listen(process.env.PORT || 8080, function(){
  console.log("express servers is listening on port " + process.env.PORT || 8080);
});