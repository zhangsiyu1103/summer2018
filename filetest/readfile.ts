let files = ["../data/university.csv", "../data/LastNames.csv"]

function getRandNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function readFiles():Promise<string[]> {
    let data: string[][] = [];
    let rows: string[];
    let BuildingList: { [key: string]: number } = {};
    let PrefixList: string[] = [];
    let returnList: string[] = [];
    for (var file of files) {
        let value = await new Promise(function (resolve, reject) {
                var req = new XMLHttpRequest();
                req.onreadystatechange = function () {
                    if (this.readyState == 4) {
                        if (this.status == 200) {
                            var lines = this.responseText.split(/\n|\r\n/);
                            data.push(lines);
                            resolve(lines);
                        } else {
                            reject(Error(req.statusText));
                        }
                    }
                }
                req.open("GET", file, true);
                req.responseType = "text";
                req.send(null);
            }
        );
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
}
readFiles().then(function(value) {
    var Locations:string[];
    Locations = value;
})
