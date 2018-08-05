var fs = require('fs');
var text = fs.readFileSync("cfgGramma.csv");
var textByLine = text.toString().split(/\n|\r\n/);
var outputdata ={};
for(let lines of textByLine){
    var rows = lines.split(',');
    var info = rows[1].split(';');
    outputdata[rows[0]] = info;
}
var json = JSON.stringify(outputdata);
fs.writeFile("try.json", json, 'utf8', function (err) {
    if (err) {
        return console.log(err);
    }

    console.log("The file was saved!");
});