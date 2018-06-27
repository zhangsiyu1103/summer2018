(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var test_1 = require("./test");
console.log(test_1.locationName);

},{"./test":2}],2:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var fs = require('fs');
var file1 = "../data/university.csv";
var file2 = "../data/LastNames.csv";
var buildingList = {};
var prefixList = [];
exports.locationName = [];
function getRandNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
var fileContents1 = fs.readFileSync(file1);
var fileContents2 = fs.readFileSync(file2);
var lines = fileContents1.toString().split(/\r\n|\n|\r/);
prefixList = fileContents2.toString().split(/\r\n|\n|\r/);
for (var i = 0; i < lines.length; i++) {
    var row = lines[i].split(',');
    buildingList[row[0]] = getRandNumber(Number(row[1]), Number(row[2]));
}
for (var key in buildingList) {
    for (var i = 0; i < buildingList[key]; i++) {
        var index = getRandNumber(0, prefixList.length - 1);
        exports.locationName.push(prefixList[index] + " " + key);
        prefixList.splice(index, 1);
    }
}

},{"fs":3}],3:[function(require,module,exports){

},{}]},{},[1]);
