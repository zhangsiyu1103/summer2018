(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
var fs = require('fs');
var file1 = "../data/university.csv";
var file2 = "../data/LastNames.csv";
var buildingList = {};
var prefixList = [];
function getRandNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
var fileContents = fs.readFileSync('../data/university.csv');
var lines = fileContents.toString().split('\n|\r\n');
console.log(lines);
//
// if ((<any>window).FileReader) {
//     let reader1 = new FileReader();
//     let reader2 = new FileReader();
//     reader1.readAsText(file1);
//     reader2.readAsText(file2);
//     reader1.onload(loadHandler1);
//     reader2.onload(loadHandler2);
// } else {
//     alert("File Reader not support");
// }
//
// function loadHandler1(event) {
//     let csv = event.target.result;
//     let Alllines = csv.split(/\r\n|\n/);
//     for (let i = 0; i < Alllines.length; i++) {
//         let row = Alllines[i].split(';');
//         buildingList[row[0]] = getRandNumber(Number(row[1]), Number(row2));
//     }
// }
//
// function loadHandler2(event) {
//     let csv = event.target.result;
//     prefixList = csv.split(/\r\n|\n/);
// }
//
// for (let key in buildingList) {
//     for (let i = 0; i < buildingList[key]; i++) {
//         let index = getRandNumber(0, prefixList.length - 1);
//         console.log(prefixList[index] + " key");
//         prefixList.splice(index, 1);
//     }
// }

},{"fs":2}],2:[function(require,module,exports){

},{}]},{},[1]);
