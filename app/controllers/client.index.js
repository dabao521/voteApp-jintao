'use strict';

(function(angular){
    var app = angular.module("votingApp", ["ui.router", "chart.js"])
        .controller("mainController", ['$scope', '$http', 'Session', 'ShowSwitch', function($scope, $http, Session, ShowSwitch){
            $scope.showList = true;
            console.log(Session);
            ShowSwitch.updateScope($scope);
        }])
        .service("Session", function($http){
            var user = null;
            this.updateUser = function(input){
                user = input;
            };
            this.getUser = function(){
                return user;
            }
        })
        .service("AuthResolve", function($q,$http, $location, Session){
            this.resolve = function(){
                 var deferred = $q.defer();
                $http.get("/api/checkUser")
                    .then(function(res){
                        if(res.data != null) {
                            $http.get("/api/user")
                                .then(function(res){
                                    Session.updateUser(res.data);
                                    deferred.resolve(res.data);
                                })
                                .catch(function(){
                                  //  $state.go("pollList");
                                    deferred.reject();
                                });
                           /// deferred.resolve(res.data);
                        }else {
                            deferred.resolve(null);
                          //  $location.path = "/logout";
                        }
                    })
                    .catch(function(err){
                      deferred.reject();
                      console.log(err);
                      $location.path = "/logout";
                    });
                return deferred.promise;
            }
        })
        .service("ShowSwitch", function(){
            var topScope;
            
            this.updateScope = function(ele){
                topScope = ele;
            };
            
            this.getScope = function(){
                return topScope;
            }
        })
        .directive("myBox", function(){
            return {
                restrict: "E",
                transclude:true,
                scope:{},
                controller: boxCtrl,
                templateUrl: "/public/directives/box.html",
            };
        })
        .directive("myNavbar", function(){
            return {
                restrict:  "E",
                scope: {},
                controller: ['$scope', 'Session', '$http',function($scope, Session, $http){
                    $http.get("/api/user")
                        .then(function(res){
                            $scope.user = res.data; 
                            Session.updateUser(res.data)});
                            
                }],
                link:navbarCtrl,
                templateUrl: "/public/directives/navbar.html"
            };
        })
        .directive("myPolllist", function(){
            return {
                restrict: "E",
                scope:{},
                require : "^^myBox",
                link: pollListLink,
                templateUrl: "/public/directives/pollList.html"
            };
        });
        
    function boxCtrl($scope, $http){
        this.getList = function(ele){
           // console.log("caocaocao");
            $http.get("/api/polls")
                .then(function(res){
                    ele.polls = res.data;
                    //console.log(res);
                })
                .catch(function(err){
                    throw err;
                });
        }
    }
    
    clientRouter(app);
    
})(window.angular);