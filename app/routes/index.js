'use strict';

var routeHndl = require(process.cwd() + "/app/controllers/server.index.js");

module.exports = function(app, passport){
    var hndl = new routeHndl(app);
    
    app.get("/", isLogin, function(req, res, next){
      return res.sendfile(process.cwd() + "/public/index.html");
    });
    
    app.get("/login", function(req, res){
        return res.sendfile(process.cwd() + "/public/login.html");
    });
    
    app.get("/logout", function(req, res){
        req.logout();
        return res.redirect("/");
    });
    
    app.get("/auth/twitter", passport.authenticate("twitter"));
    
    app.get("/auth/twitter/callback", passport.authenticate("twitter", {
        successRedirect: '/',
        failureRedirect: '/login'
    }));
    
    app.get("/auth/twitter/callback", passport.authenticate("twitter", {
        successRedirect : "/",
        failureRedirect : "/check"
    }));
    
    app.get("/api/polls", hndl.getAllPolls);
    app.get("/api/polls/:pollId", hndl.getPoll);
    app.get("/api/users/:userId/polls",isLogin, hndl.getUserPolls)
    app.put("/api/polls/:pollId", hndl.updatePoll);// when user select the poll
    app.post("/api/polls/:pollId", isLogin, hndl.createPoll);
    app.delete("/api/polls/:pollId", isLogin, hndl.deletePoll);
    
    app.get("/api/user",isLogin, hndl.getUser);
    
    app.get("/api/checkUser", function(req, res){
       // console.log("Some one check me!!");
        if(req.isAuthenticated()) {
            return res.json(req.user);
        }else {
            //return res.redirect("/login");
            return res.json(null);
        }
    });
    
    
    function isLogin(req, res, next) {
        if(req.isAuthenticated()){
            return next();
        }else {
            return res.redirect("/login");
        }
    }
}