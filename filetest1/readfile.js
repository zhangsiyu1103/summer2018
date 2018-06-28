function readTextFile(file) {
    var rawFile = new XMLHttpRequest();
    rawFile.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);
        }
    }
    rawFile.open("GET", file, true);
    rawFile.responseType="text";
    rawFile.send(null);
}

readTextFile("testing.txt");