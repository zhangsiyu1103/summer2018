let file1 = "file:///Users/zhangsiyu/Documents/summer2018/data/university.csv";
let file2 = "file:///Users/zhangsiyu/Documents/summer2018/dataLastNames.csv";
// let buildingList:{[key:string]:number} = {};
// let prefixList: string[] = [];
// export var locationName: string[] = [];

function getRandNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
var allText

function readTextFile(file) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                allText = rawFile.responseText;
                console.log(allText);
            }
        }
    }
    console.log(allText);
    rawFile.send();
}

readTextFile(file1);
// let fileContents1 = fs.readFileSync(file1);
// let fileContents2 = fs.readFileSync(file2);
// let lines = fileContents1.toString().split(/\r\n|\n|\r/);
// prefixList = fileContents2.toString().split(/\r\n|\n|\r/);
// for (let i = 0; i < lines.length; i++) {
//     let row = lines[i].split(',');
//     buildingList[row[0]] = getRandNumber(Number(row[1]), Number(row[2]));
// }
// for (let key in buildingList) {
//     for (let i = 0; i < buildingList[key]; i++) {
//         let index = getRandNumber(0, prefixList.length - 1);
//         locationName.push(prefixList[index] + " " + key);
//         prefixList.splice(index, 1);
//     }
// }
