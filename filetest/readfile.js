"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let files = ["../data/university.csv", "../data/LastNames.csv"];
function getRandNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function readFiles() {
    return __awaiter(this, void 0, void 0, function* () {
        let data = [];
        let rows;
        let BuildingList = {};
        let PrefixList = [];
        let returnList = [];
        for (var file of files) {
            let value = yield new Promise(function (resolve, reject) {
                var req = new XMLHttpRequest();
                req.onreadystatechange = function () {
                    if (this.readyState == 4) {
                        if (this.status == 200) {
                            var lines = this.responseText.split(/\n|\r\n/);
                            data.push(lines);
                            resolve(lines);
                        }
                        else {
                            reject(Error(req.statusText));
                        }
                    }
                };
                req.open("GET", file, true);
                req.responseType = "text";
                req.send(null);
            });
        }
        for (let i = 0; i < data[0].length; i++) {
            rows = data[0][i].split(',');
            BuildingList[rows[0]] = getRandNumber(Number(rows[1]), Number(rows[2]));
        }
        PrefixList = data[1];
        for (var key in BuildingList) {
            for (let j = 0; j < BuildingList[key]; j++) {
                let index = getRandNumber(0, PrefixList.length - 1);
                returnList.push(PrefixList[index] + " " + key);
                PrefixList.splice(index, 1);
            }
        }
        return Promise.resolve(returnList);
    });
}
readFiles().then(function (value) {
    var Locations;
    Locations = value;
});
console.log(Locations);
// get(files[0]).then(function (response) {
//     data = response;
// }, function (error) {
//     console.error("Failed!", error);
// })
// var data = ProcessFiles();
// console.log(data);
// var processData = function (input1, input2) {
//     console.log(input1);
//     console.log(input2);
//     // BuildingList= input2;
//     //
//     // BuildingList;
// };
// function readTextFile(file1: string, file2: string, callback:
//     (input1: { [key: string]: number }, input2: string[]) => void) {
//     var rawFile = new XMLHttpRequest();
//     var newList: { [key: string]: number } = {};
//     rawFile.onreadystatechange = function () {
//         if (this.readyState == 4 && this.status == 200) {
//             var lines = this.responseText.split(/\n|\r\n/);
//             for (let i = 0; i < lines.length; i++) {
//                 let row: string[] = lines[i].split(',');
//                 newList[row[0]] = getRandNumber(Number(row[1]), Number(row[2]));
//             }
//
//             var anotherCall = new XMLHttpRequest();
//             var secondList: string[]
//             anotherCall.onreadystatechange = function () {
//                 if (anotherCall.readyState == 4 && anotherCall.status == 200) {
//                     secondList = anotherCall.responseText.split(/\n|\r\n/);
//                     callback(newList, secondList);
//                 }
//             }
//             anotherCall.open("GET", file2, true);
//             anotherCall.responseType = "text";
//             anotherCall.send(null);
//         }
//     }
//     rawFile.open("GET", file1, true);
//     rawFile.responseType = "text";
//     rawFile.send(null);
// }
// readTextFile(file1, file2, processData);
//BuildingList = readTextFile(file1, file2, processData);
//console.log(BuildingList);
//console.log(BuildingList)
// console.log(BuildingList);
// for(let i = 0; i < lines.length;i++){
//     let row:string[]  = lines[i].split(',');
//     BuildingList[row[0]] = getRandNumber(Number(row[1]), Number(row[2]));
// }
// PrefixList = readTextFile(file2);
//
// for (let key in BuildingList){
//     for(let i = 0; i < BuildingList[key];i++){
//         let index:number = getRandNumber(0, PrefixList.length-1);
//         console.log(PrefixList[index] + " " + BuildingList[key]);
//         PrefixList.splice(index,1);
//     }
// }
