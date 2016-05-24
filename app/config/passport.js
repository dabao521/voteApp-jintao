'use strict';


var twitterStrategy = require("passport-twitter").Strategy;
var users = require("../models/users.js");

var authConfig = require(process.cwd() + "/app/config/auth.js");

module.exports = function(passport){
    passport.serializeUser(function(user, done){
        done(null, user.id);
    });
    passport.deserializeUser(function(id, done){
        users.findById(id, function(err, user){
            done(err, user);
        });
    });
    
    passport.use(new twitterStrategy({
        consumerKey: authConfig.twitter.consumerKey,
        consumerSecret: authConfig.twitter.consumerSecret,
        callbackURL: authConfig.twitter.callbackURL
    }, function(token, refreshToken, profile, done){
        process.nextTick(function(){
            //console.log("caocao");
            users.findOne({"twitter.userId": profile.id}, (function(err, user){
                if(err) {
                    return done(err);
                }
                //console.log(user);
                if(user) {
                    return done(null, user);
                }else {
                    //console.log(profile);
                    var newuser = new users();
                     newuser.twitter.userId = profile.id;
                     newuser.twitter.userName = profile.displayName;
                     newuser.twitter.polls = [];
                     //console.log("new user : " + newuser);
                     newuser.save(function(err){
                        if(err) {
                            throw err;
                        }
                        done(null, newuser);
                    });
                }
            }));
        });
    }));
};

