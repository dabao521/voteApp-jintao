'use strict';

function clientRouter(app){
    //console.log("hello");
    app.config(['$stateProvider','$urlRouterProvider',function($stateProvider, $urlRouterProvider,AuthResolve, $state){
        // $urlRouterProvider.when("", "/");
        // $urlRouterProvider.otherwise("/");
        $stateProvider.
            state("pollList", {
                url:"/pollList",
                templateUrl : "/public/directives/pollList.html",
                controller: pollListCtrl
            }).
            state("newPoll", {
                url:"/newPoll",
                templateUrl : "/public/newPoll.html",
                controller: newPollCtrl,
                resolve: {
                    auth : function(AuthResolve){
                        return AuthResolve.resolve();
                    }
                }
            }).
            state("myPolls", {
                url: "/myPolls",
                templateUrl : "/public/myPolls.html",
                controller: myPollCtrl,
                resolve :{
                    auth : function(AuthResolve){
                        return AuthResolve.resolve();
                    }
                }
            }).
            state("unauth", {
                url: "/unauth",
                templateUrl: "/public/unauth.html"
            }).
            state("showPoll", {
                url:"/showPoll/:pollId",
                templateUrl: "/public/pollAdmin.html",
                controller: pollAdminCtrl,
                 resolve: {
                     checkUser: function($q, $http){
                         var deferred = $q.defer();
                         $http.get("/api/checkUser")
                            .then(function(res){
                                console.log(res.data);
                                deferred.resolve(res.data);
                            })
                            .catch(function(){
                                deferred.reject();
                            });
                        return deferred.promise;
                     }
                 }
            });
        $urlRouterProvider.when("/unauth", "/unauth");
        $urlRouterProvider.otherwise("/pollList");
    }]);
    
    function myPollCtrl($http, $state, Session, $scope, auth, $location){
        if(auth == null) {
            console.log("Unauthorized user");
            $location.path("/unauth");
            return;
        }        
        $scope.user = Session.getUser();
        $http.get("/api/users/" + Session.getUser().twitter.userId + "/polls")
            .then(function(res){
                console.log(res.data);
                $scope.polls = res.data;   
            })
            .catch(function(err){
                throw err;
            });
    }
    
    function pollListCtrl($scope, $http){
        $http.get("/api/polls")
            .then(function(res){
                $scope.polls = res.data;
                //console.log("hellow: " + $scope.polls);
            })
            .catch(function(err){
                throw err;
            });
    }
    
    function pollAdminCtrl(ShowSwitch, $scope, $stateParams, $http, $state, Session, checkUser){
        ShowSwitch.getScope().showList = false;
        $scope.showErr = false;
        $scope.selected = false;
        var pollItem;
        console.log("checkUser:", checkUser);
        console.log("Seesion: ", Session.getUser().twitter)
        if(checkUser == null) {
            $scope.isUser = false;
        }else {
            $scope.isUser = true;
        }
        $http.get("/api/polls/" + $stateParams.pollId)
            .then(function(res){
                $scope.poll = res.data[0];
                $scope.pollOptions = Object.keys(res.data[0].pollOptions);
                pollItem = res.data[0];
                drawPie(pollItem, $scope);
            })
            .catch(function(err){
                throw err;
            });
        $scope.submitOption = function(){
          //  console.log("I am chossing option : ", $scope.selectOption);
           if($scope.selectOption == null || $scope.selectOption.length == 0) {
               $scope.showErr = true;
               $scope.errInfo = "Please choose one option!";
               return;
           }
           if($scope.selected) {
               $scope.showErr = true;
               $scope.errInfo = "You already selected one, can not selected multiple times";
               return;
           }
           $scope.selected = true;
           $scope.showErr = false;
            var findObj = {
                "pollId" : $stateParams.pollId,
                "selectOption" : $scope.selectOption,
                "userId" : $scope.isUser ? Session.getUser().twitter.userId : "LUREN"
            };
          //  console.log("haha: " + Session.getUser().twitter.userId)
            $http.put("/api/polls/" + $stateParams.pollId, findObj)
                .then(function(res){
                    console.log(res.data);
                    if(res.data == "Err") {
                        $scope.showErr = true;
                        console.log("adfa");
                        $scope.errInfo = "You already selected one, can not selected multiple times";
                        return;
                    }
                    pollItem.pollOptions[$scope.selectOption]++;
                    drawPie(pollItem, $scope);
                    
                })
                .catch(function(err){
                    throw err;
                });
        };
        $scope.deletePoll = function(){
            $http.delete("/api/polls/" + $stateParams.pollId)
                .then(function(res){
                    console.log("leave");
                    $state.go("pollList");
                })
                .catch(function(err){
                    throw err;
                });
        }
    }
    
    function drawPie(poll, scope) {
        console.log(poll.pollId);
       scope.chartLabels = Object.keys(poll.pollOptions);
       //console.log(scope.chartLabels);
       scope.chartData = [];
       scope.chartLabels.forEach(function(key){
           scope.chartData.push(poll.pollOptions[key]);
       });
    }
    
    function newPollCtrl($scope, $http, $location, Session, ShowSwitch, $state, auth){
        if(auth == null) {
            console.log("Unauthorized user");
            $location.path("/unauth");
            return;
        }
       ShowSwitch.getScope().showList = false;
      // console.log(ShowSwitch.getScope().showList);
       $scope.titleInput = "";
       $scope.optionsInput = "";
       $scope.submitPoll = function(){
         //  console.log($scope.titleInput, $scope.optionsInput);
           var pollId = "poll" + Date.now();
           var pollObj = {};
           $scope.showErr = false;
           pollObj.pollId = pollId;
           pollObj.pollTitle = $scope.titleInput.replace(/^\s*/, "").replace("/$\s*/", "");
           var temPollOptions = $scope.optionsInput.split(/\n/).map(function(item){
               item = item.replace(/^\s*/g, "");
               item = item.replace(/\s*$/, "");
               return item;
           }).filter(function(item){
               return item.length != 0;
           });
           pollObj.pollOptions = {};
           temPollOptions.forEach(function(item){
              // console.log("item: " + item);
               pollObj.pollOptions[item] = 0;
           });
          // console.log(pollObj);
           if(pollObj.pollTitle.length == 0 || temPollOptions.length < 2) {
               $scope.showErr = true;
               return;
           }
           $scope.showErr = false;
           pollObj.userId = Session.getUser().twitter.userId;
          // console.log("userID: " + pollObj.userId);
          // console.log(pollObj);
           $http.post("/api/polls/" + pollId, pollObj)
                .then(function(result){
                    //console.log("success:" ,result);
                    $state.go("showPoll", {"pollId" : pollId});
                })
                .catch(function(err){
                    throw err;
                });
       }
    }
}