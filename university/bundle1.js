(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var fs = require('fs')


let file1 = "../data/university.csv";
let file2 = "../data/LastNames.csv";
//let buildingList:{[key:string]:number} = {};
//let prefixList: string[] = [];

function getRandNumber(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let fileContents = fs.readFileSync('../data/university.csv');
let lines = fileContents.toString().split('\n|\r\n');
console.log(lines);
},{"fs":2}],2:[function(require,module,exports){

},{}]},{},[1]);
