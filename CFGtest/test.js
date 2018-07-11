function combine(dict1, dict2) {
    var temp = dict2;
    for (var _i = 0, _a = Object.keys(dict1); _i < _a.length; _i++) {
        var val = _a[_i];
        temp[val] = dict1[val];
    }
    return temp;
}
var dic1 = { 'a': 'A' };
var dic2 = { 'b': 'B' };
console.log(combine(dic1, dic2));
console.log(dic2);
