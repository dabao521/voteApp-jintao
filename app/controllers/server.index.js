'use strict';

var users = require(process.cwd() + "/app/models/users.js");
var polls = require(process.cwd() + "/app/models/polls.js");

module.exports = function(app) {
  this.getAllPolls = function(req, res, next){
   // console.log("caocao");
    polls.find({}, function(err, results){
      if(err){
        throw err;
      }
      //console.log(results);
      return res.json(results);
    });
  };
  
  this.getUser = function(req, res){
   // console.log(req.user);
    return res.json(req.user);
  };
  
  this.getPoll= function(req, res, next){
  //  console.log("aks poll");
     polls.find({"pollId":req.params.pollId}, function(err, result){
       if(err) {
         throw err;
       }
       //console.log(result)
       return res.json(result);
     })
  };
  
  this.getUserPolls = function(req, res, next){
  //  console.log(req.params.userId);
    users.findOne({"twitter.userId" : req.params.userId}, function(err, user){
        if(err){
            throw err;
        }
        var rtPolls = [];
        findUserPolls(0, user.twitter.polls, rtPolls, function(){
           // console.log("rt", rtPolls);
            return res.json(rtPolls);
        });
    });
  };
  
  this.updatePoll = function(req, res, next){
      polls.findOne({"pollId" : req.body.pollId}, function(err, tg){
        if(err) {
          throw err;
        }
        tg.pollOptions[req.body.selectOption]++;
        if(tg.votedUsers.indexOf(req.body.userId) != -1) {
           // console.log("Already voted");
            return res.send('Err');
        }
        if(req.body.userId != "LUREN") {
            tg.votedUsers.push(req.body.userId);
        }else {
            //console.log("wow, I am lUREn");
        }
        
        polls.update({"pollId" : req.body.pollId}, {
            "pollOptions" : tg.pollOptions,
            "votedUsers" : tg.votedUsers
        }, function(err, result){
          if(err) {
            throw err;
          }
          return res.json(tg);
        })
      })
  };
  
  this.createPoll = function(req, res, next){
   // console.log("haha: ",req.body);
    var newpoll = new polls();
    newpoll.pollId = req.body.pollId;
    newpoll.pollTitle = req.body.pollTitle;
    newpoll.pollOptions = req.body.pollOptions;
    newpoll.userId = req.body.userId;
    newpoll.votedUsers = [];
    newpoll.save(function(err){
      if(err){
        throw err;
      }
      users.update({"twitter.userId" : req.body.userId}, {$push: {"twitter.polls": req.body.pollId}}, function(err, result){
        if(err) {
          throw err;
        }
        return res.json(result);
      });
    });
  };
  
  this.deletePoll = function(req, res, next){
    polls.findOne({"pollId" : req.params.pollId}, function(err, poll){
        if(err) {
            throw err;
        }
        var votedUsers = poll.votedUsers;
        polls.remove({"pollId" : req.params.pollId}, function(err, result){
            if(err) {
                throw err;
            }
            removePollFromUser(0, votedUsers, req.params.pollId);
            return res.send("done");
        })
    });
  };
  
  function findUserPolls(i, pollIds, rt, callback){
      if(i == pollIds.length) {
          callback();
          return;
      }
     // console.log("processing", pollIds[i])
      polls.findOne({"pollId" : pollIds[i]}, function(err, poll){
          if(err){
              throw err;
          }
          rt.push(poll);
          findUserPolls(i + 1, pollIds, rt, callback);
      });
  }
  
  function removePollFromUser(i, votedUsers, pollId){
      if(i == votedUsers.length) {
          return;
      }
     // console.log("processing number : " + i + " " + votedUsers[i]);
      users.findOne({"twitter.userId" : votedUsers[i]}, function(err, user){
          if(err){
              throw err;
          }
       //   console.log(user);
          var newPollArr = user.twitter.polls.filter(function(pid){
              if(pid != pollId) {
                  return true;
              }
              return false;
          });
          users.update({"twitter.userId" : votedUsers[i]}, {"twitter.polls" : newPollArr}, function(err, result){
              if(err) {
                  throw err;
              }
              removePollFromUser(i  + 1, votedUsers, pollId)
          })
      })
  }
}
