"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
//The gramma for university is generated after viewing the maps of five universities: UCSD;NCSU;UNC;DUKE;GRINNELL
//The Prefix is taken from http://www.quietaffiliate.com/free-first-name-and-last-name-databases-csv-and-sql/
var files = ["cfgGramma", "Prefix"];
var filesuffix = '.csv';
var sigma = require('sigma');
window.sigma = sigma;
require('sigma/plugins/sigma.plugins.dragNodes/sigma.plugins.dragNodes');
require('sigma/plugins/sigma.plugins.animate/sigma.plugins.animate');
require('sigma/plugins/sigma.layout.noverlap/sigma.layout.noverlap');
require('sigma/src/middlewares/sigma.middlewares.rescale');
var cfgTrees = /** @class */ (function () {
    function cfgTrees(name, rule, prefix, prevName) {
        var cleanName;
        this.branches = null;
        this.idLabel = {};
        if (name.startsWith('#')) {
            this.branches = [];
            if (name.endsWith('*')) {
                cleanName = name.substring(1, name.length - 1);
                this.val = cleanName;
                this.idLabel[this.val] = cleanName;
            }
            else if (name.endsWith('$')) {
                cleanName = name.substring(1, name.length - 1);
                this.val = prevName + " " + cleanName;
                this.idLabel[this.val] = cleanName;
            }
            else {
                cleanName = name.substring(1, name.length);
                this.val = retRand(prefix) + " " + cleanName;
                this.idLabel[this.val] = this.val;
            }
            var children = rule[cleanName];
            for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
                var value = children_1[_i];
                var newBranch = new cfgTrees(value, rule, prefix, this.val);
                combine(this.idLabel, newBranch.idLabel);
                this.branches.push(newBranch);
            }
        }
        else if (name.endsWith('*')) {
            cleanName = name.substring(0, name.length - 1);
            this.val = cleanName;
            this.idLabel[this.val] = cleanName;
        }
        else if (name.endsWith('$')) {
            cleanName = name.substring(0, name.length - 1);
            this.val = prevName + " " + cleanName;
            this.idLabel[this.val] = cleanName;
        }
        else {
            cleanName = name;
            this.val = retRand(prefix) + " " + cleanName;
            this.idLabel[this.val] = this.val;
        }
    }
    cfgTrees.prototype.getValue = function () {
        return this.val;
    };
    cfgTrees.prototype.getBranches = function () {
        return this.branches;
    };
    cfgTrees.prototype.isLeaf = function () {
        return (this.branches == null);
    };
    cfgTrees.prototype.getIdLabelPair = function () {
        return this.idLabel;
    };
    cfgTrees.prototype.getBranchValues = function () {
        var ret = [];
        if (this.branches != null) {
            for (var _i = 0, _a = this.branches; _i < _a.length; _i++) {
                var value = _a[_i];
                ret.push(value.val);
            }
        }
        return ret;
    };
    cfgTrees.prototype.getExpandList = function () {
        var expandList = {};
        if (this.branches != null) {
            expandList[this.val] = this.getBranchValues();
            for (var _i = 0, _a = this.branches; _i < _a.length; _i++) {
                var tree = _a[_i];
                combine(expandList, tree.getExpandList());
            }
        }
        return expandList;
    };
    cfgTrees.prototype.getExpandGraph = function () {
        var expandList = this.getExpandList();
        var expandGraph = {};
        for (var _i = 0, _a = Object.keys(expandList); _i < _a.length; _i++) {
            var keys = _a[_i];
            expandGraph[keys] = connectNodes(expandList[keys]);
        }
        return expandGraph;
    };
    //This method ignores the first value of the tree
    cfgTrees.prototype.getAllValues = function () {
        var ret = [];
        ret = ret.concat(this.getBranchValues());
        if (this.branches != null) {
            for (var _i = 0, _a = this.branches; _i < _a.length; _i++) {
                var tree = _a[_i];
                ret = ret.concat(tree.getBranchValues());
            }
        }
        return ret;
    };
    cfgTrees.prototype.print = function () {
        if (this.branches != null) {
            console.log(this.branches);
            for (var _i = 0, _a = this.branches; _i < _a.length; _i++) {
                var value = _a[_i];
                value.print();
            }
        }
    };
    return cfgTrees;
}());
function getRandNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function retRand(list) {
    var index = getRandNumber(0, list.length - 1);
    var ret = list[index];
    list.splice(index, 1);
    return ret;
}
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
function readFiles() {
    return __awaiter(this, void 0, void 0, function () {
        var data, _i, files_1, file, value;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    data = {};
                    _i = 0, files_1 = files;
                    _a.label = 1;
                case 1:
                    if (!(_i < files_1.length)) return [3 /*break*/, 4];
                    file = files_1[_i];
                    return [4 /*yield*/, new Promise(function (resolve, reject) {
                            var req = new XMLHttpRequest();
                            req.onreadystatechange = function () {
                                if (this.readyState == 4) {
                                    if (this.status == 200) {
                                        var lines = this.responseText.split(/\n|\r\n/);
                                        data[file] = lines;
                                        resolve(lines);
                                    }
                                    else {
                                        reject(Error(req.statusText));
                                    }
                                }
                            };
                            req.open("GET", file + filesuffix, true);
                            req.responseType = "text";
                            req.send(null);
                        })];
                case 2:
                    value = _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, Promise.resolve(data)];
            }
        });
    });
}
readFiles().then(function (value) {
    var tree = processData(value);
    //console.log(tree.getExpandList());
    //tree.print();
    visualize(tree);
});
function combine(dict1, dict2) {
    for (var _i = 0, _a = Object.keys(dict2); _i < _a.length; _i++) {
        var val = _a[_i];
        dict1[val] = dict2[val];
    }
    return dict1;
}
function processData(data) {
    var Prefix = data['Prefix'];
    var newRule = {};
    var rawRule = data['cfgGramma'];
    for (var i = 0; i < rawRule.length; i++) {
        var rows = rawRule[i].split(',');
        var children = rows[1].split(';');
        var result = [];
        for (var j = 0; j < children.length; j++) {
            var elements = children[j].split('.');
            var num = getRandNumber(Number(elements[1]), Number(elements[2]));
            for (var k = 0; k < num; k++) {
                result.push(elements[0]);
            }
        }
        newRule[rows[0]] = result;
    }
    var newTree = new cfgTrees('#University', newRule, Prefix, '');
    return newTree;
}
function connectNodes(location) {
    var nodes = {};
    var visited = {};
    for (var i = 0; i < location.length; i++) {
        visited[location[i]] = false;
    }
    var stack = [];
    var rest = [];
    //randomly generate a graph
    for (var i = 0; i < location.length; i++) {
        if ((typeof nodes[location[i]]) === 'undefined') {
            nodes[location[i]] = [];
        }
        for (var j = i + 1; j < location.length; j++) {
            if ((typeof nodes[location[j]]) === 'undefined') {
                nodes[location[j]] = [];
            }
            if (Math.random() < 0.1) {
                nodes[location[i]].push(location[j]);
            }
        }
    }
    //making sure it is connected
    for (var i = 0; i < location.length; i++) {
        if (visited[location[i]] == false) {
            var item = location[i];
            stack.push(location[i]);
            while (stack.length > 0) {
                var cur = stack.pop();
                if (cur !== undefined) {
                    if (visited[cur] == false) {
                        visited[cur] = true;
                        if (Math.random() < 0.3) {
                            item = cur;
                        }
                        for (var _i = 0, _a = nodes[cur]; _i < _a.length; _i++) {
                            var val = _a[_i];
                            stack.push(val);
                        }
                    }
                }
            }
            rest.push(item);
        }
    }
    for (var i = 0; i < rest.length - 1; i++) {
        nodes[rest[i]].push(rest[i + 1]);
    }
    return nodes;
}
function visualize(Tree) {
    var expandGraph = Tree.getExpandGraph();
    var expandList = Tree.getExpandList();
    var idLabelPair = Tree.getIdLabelPair();
    var bool = {};
    for (var _i = 0, _a = Tree.getAllValues(); _i < _a.length; _i++) {
        var val = _a[_i];
        bool[val] = false;
    }
    console.log(expandList);
    var edgeID = 0;
    var InitialGraph = expandGraph[Tree.getValue()];
    function remove_connect(node_id) {
        if (Object.keys(expandList).includes(node_id)) {
            bool[node_id] = false;
            var related = expandList[node_id];
            var i;
            for (i = 0; i < related.length; i++) {
                if (bool[related[i]] == true) {
                    remove_connect(related[i]);
                }
                sigmaInstance.graph.dropNode(related[i]);
            }
            setTimeout(function () {
                sigmaInstance.refresh();
            }, 500);
        }
    }
    function newNodes(node_t) {
        if (Object.keys(expandGraph).includes(node_t.id)) {
            bool[node_t.id] = true;
            var newlocations = expandGraph[node_t.id];
            show(newlocations);
            sigmaInstance.graph.addEdge({
                id: 'e' + (edgeID++).toString(),
                source: node_t.id,
                target: expandList[node_t.id][0],
                size: 10
            });
            setTimeout(function () {
                sigmaInstance.refresh();
                sigmaInstance.startNoverlap();
            }, 500);
        }
    }
    function show(locationGraph) {
        //console.log(locationGraph);
        for (var locations in locationGraph) {
            sigmaInstance.graph.addNode({
                // Main attributes:
                id: locations,
                label: idLabelPair[locations],
                x: Math.random(),
                y: Math.random(),
                size: 17,
                borderColor: getRandomColor()
            });
        }
        for (var locations in locationGraph) {
            var adjacent = locationGraph[locations];
            for (var _i = 0, adjacent_1 = adjacent; _i < adjacent_1.length; _i++) {
                var adj = adjacent_1[_i];
                sigmaInstance.graph.addEdge({
                    id: 'e' + (edgeID++).toString(),
                    source: locations,
                    target: adj,
                    size: 10
                });
            }
        }
    }
    //for custom shapes
    sigma.canvas.nodes.border = function (node, context, settings) {
        var prefix = settings('prefix') || '';
        context.fillStyle = node.color || settings('defaultNodeColor');
        context.beginPath();
        context.arc(node[prefix + 'x'], node[prefix + 'y'], node[prefix + 'size'], 0, Math.PI * 2, true);
        context.closePath();
        context.fill();
        // Adding a border
        context.lineWidth = node.borderWidth || 2;
        context.strokeStyle = node.borderColor || '#fff';
        context.stroke();
    };
    //Initialize sigma
    var sigmaInstance = new sigma({
        graph: {
            nodes: [],
            edges: []
        },
        renderer: {
            type: 'canvas',
            container: 'graph-container'
        },
        settings: {
            defaultNodeColor: '#000',
            defaultNodeType: 'border',
            defaultLabelColor: '#fff',
            labelThreshold: 100,
            defaultEdgeColor: '#fff',
            edgeColor: 'default'
        }
    });
    show(InitialGraph);
    sigmaInstance.bind('clickNode', click_node_function);
    var dragListener = sigma.plugins.dragNodes(sigmaInstance, sigmaInstance.renderers[0]);
    dragListener.bind('startdrag', function (event) {
        console.log(event);
    });
    dragListener.bind('drag', function (event) {
        console.log(event);
        sigmaInstance.unbind('clickNode');
    });
    dragListener.bind('drop', function (event) {
        console.log(event);
        setTimeout(function () {
            sigmaInstance.bind('clickNode', click_node_function);
        }, 200);
    });
    dragListener.bind('dragend', function (event) {
        console.log(event);
    });
    sigmaInstance.refresh();
    function click_node_function(event) {
        if (bool[event.data.node.id] == false) {
            newNodes(event.data.node);
        }
        else {
            remove_connect(event.data.node.id);
        }
    }
    var config = {
        nodeMargin: 20,
        gridSize: 5,
    };
    //Configure the algorithm
    var listener = sigmaInstance.configNoverlap(config);
    //Bind all events:
    listener.bind('start stop interpolate', function (event) {
        console.log(event.type);
    });
    //Start the algorithm:
    sigmaInstance.startNoverlap();
}
