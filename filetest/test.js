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
