var fs = require('fs')

let file1 = "../data/university.csv";
let file2 = "../data/LastNames.csv";
let buildingList:{[key:string]:number} = {};
let prefixList: string[] = [];
export var locationName: string[] = [];

function getRandNumber(min:number, max:number):number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let fileContents1 = fs.readFileSync(file1);
let fileContents2 = fs.readFileSync(file2);
let lines = fileContents1.toString().split(/\r\n|\n|\r/);
prefixList = fileContents2.toString().split(/\r\n|\n|\r/);
for (let i = 0; i < lines.length; i++) {
    let row = lines[i].split(',');
    buildingList[row[0]] = getRandNumber(Number(row[1]), Number(row[2]));
}
for (let key in buildingList) {
    for (let i = 0; i < buildingList[key]; i++) {
        let index = getRandNumber(0, prefixList.length - 1);
        locationName.push(prefixList[index] + " " + key);
        prefixList.splice(index, 1);
    }
}
