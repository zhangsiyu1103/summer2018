function getRandNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
var List = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];

function retRand(list){
    var index = getRandNumber(0,List.length-1);
    var ret = list[index];
    list.splice(index,1);
    return ret;
}

console.log(List);
console.log("removed: " + retRand(List));
console.log(List);