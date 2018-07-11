function combine(dict1, dict2) {
    let temp = dict2;
    for (var val of Object.keys(dict1)) {
        temp[val] = dict1[val];
    }
    return temp;
}
let dic1={'a':'A'};
let dic2={'b':'B'};
console.log(combine(dic1,dic2));
console.log(dic2);