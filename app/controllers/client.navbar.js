'use strict';

function navbarCtrl  (scope, ele, attrs, ctrl) {
        //console.log("cao");
       // console.log(attrs);
        if(attrs.login == "true") {
            scope.showUser = true;
        }else {
            scope.showUser = false;
        }
        
    };
