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
exports.__esModule = true;
var scripting_1 = require("./scripting");
var util_1 = require("typescript-collections/dist/lib/util");
//require all the library needed
var sigma = require('linkurious');
window.sigma = sigma;
require('linkurious/plugins/sigma.plugins.dragNodes/sigma.plugins.dragNodes');
require('linkurious/plugins/sigma.plugins.animate/sigma.plugins.animate');
require('linkurious/plugins/sigma.layouts.noverlap/sigma.layouts.noverlap');
require('linkurious/plugins/sigma.renderers.linkurious/canvas/sigma.canvas.nodes.def');
require('linkurious/plugins/sigma.plugins.tooltips/sigma.plugins.tooltips');
require('linkurious/plugins/sigma.plugins.design/sigma.plugins.design');
//File names
var filePrefix = "../data/";
var files = ["cfgGramma.csv", "Prefix.csv", "NPCconstraint.txt"];
//A structure for hierarchical generation
var cfgTrees = /** @class */ (function () {
    function cfgTrees(name, rule, prefix, prevName) {
        var cleanName;
        var idpre = '';
        var labelpre = '';
        this.branches = null;
        this.idLabel = {};
        this.assortedDict = {};
        this.items = null;
        //* means the names remain unchanged
        //$ means the names has a prefix as previous name
        //# means the location is expandable
        //! means the names are items
        if (name.startsWith('!')) {
            var itemname = name.substring(1, name.length);
            this.items = [];
            this.items.push(prevName + " " + itemname);
            this.idLabel[prevName + " " + itemname] = itemname;
            this.val = 'item';
        }
        else {
            if (name.endsWith('$')) {
                cleanName = name.substring(0, name.length - 1);
                idpre = prevName + " ";
            }
            else {
                cleanName = name;
                idpre = retRand(prefix) + ' ';
                labelpre = idpre;
            }
            if (name.startsWith('#')) {
                this.branches = [];
                cleanName = cleanName.substring(1);
                var children = processRand(rule[cleanName]);
                for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
                    var value = children_1[_i];
                    var newBranch = new cfgTrees(value, rule, prefix, idpre + cleanName);
                    combine(this.idLabel, newBranch.idLabel);
                    combine(this.assortedDict, newBranch.assortedDict);
                    this.branches.push(newBranch);
                }
            }
            this.val = idpre + cleanName;
            this.idLabel[this.val] = labelpre + cleanName;
            if (util_1.isUndefined(this.assortedDict[cleanName.toLowerCase()])) {
                this.assortedDict[cleanName.toLowerCase()] = [];
            }
            this.assortedDict[cleanName.toLowerCase()].push(this.val);
        }
    }
    cfgTrees.prototype.getValue = function () {
        return this.val;
    };
    cfgTrees.prototype.getBranches = function () {
        return this.branches;
    };
    cfgTrees.prototype.getIdLabelPair = function () {
        return this.idLabel;
    };
    // return the children's location names
    cfgTrees.prototype.getBranchValues = function () {
        var ret = [];
        if (this.branches != null) {
            for (var _i = 0, _a = this.branches; _i < _a.length; _i++) {
                var value = _a[_i];
                if (value.val != 'item') {
                    ret.push(value.val);
                }
            }
        }
        return ret;
    };
    //return a dict for expandable locations and their children
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
    //return a pair of each location and their parents' location
    cfgTrees.prototype.getPrevnameList = function () {
        var PrevnameList = {};
        for (var _i = 0, _a = this.getBranchValues(); _i < _a.length; _i++) {
            var name_1 = _a[_i];
            PrevnameList[name_1] = this.val;
        }
        if (this.branches != null) {
            for (var _b = 0, _c = this.branches; _b < _c.length; _b++) {
                var tree = _c[_b];
                combine(PrevnameList, tree.getPrevnameList());
            }
        }
        return PrevnameList;
    };
    //return a dict for assorted types
    cfgTrees.prototype.getAssortedDict = function () {
        return this.assortedDict;
    };
    //return a dict for the location and items corresponding to each location.
    cfgTrees.prototype.getItemsList = function () {
        var ret = {};
        if (this.items != null) {
            ret[this.val] = this.items;
        }
        if (this.branches != null) {
            for (var _i = 0, _a = this.branches; _i < _a.length; _i++) {
                var tree = _a[_i];
                combine(ret, tree.getItemsList());
            }
        }
        return ret;
    };
    //return a list of all locations in the map
    cfgTrees.prototype.getAlllocations = function () {
        var ret = [];
        ret.push(this.getValue());
        if (this.branches != null) {
            for (var _i = 0, _a = this.branches; _i < _a.length; _i++) {
                var child = _a[_i];
                ret = ret.concat(child.getAlllocations());
            }
        }
        return ret;
    };
    cfgTrees.prototype.print = function () {
        console.log(this.getValue());
        if (this.branches != null) {
            for (var _i = 0, _a = this.branches; _i < _a.length; _i++) {
                var value = _a[_i];
                value.print();
            }
        }
    };
    return cfgTrees;
}());
//A function for combining to dictionary
function combine(dict1, dict2) {
    for (var _i = 0, _a = Object.keys(dict2); _i < _a.length; _i++) {
        var val = _a[_i];
        if (util_1.isUndefined(dict1[val])) {
            dict1[val] = dict2[val];
        }
        else {
            dict1[val] = dict1[val].concat(dict2[val]);
        }
    }
    return dict1;
}
//A function for return and delete a random number from a list
function retRand(list) {
    var index = scripting_1.getRandNumber(0, list.length - 1);
    var ret = list[index];
    list.splice(index, 1);
    return ret;
}
//Reading the files
function readFiles() {
    return __awaiter(this, void 0, void 0, function () {
        var data, _loop_1, _i, files_1, file;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    data = {};
                    _loop_1 = function (file) {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, new Promise(function (resolve, reject) {
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
                                        req.open("GET", filePrefix + file, true);
                                        req.responseType = "text";
                                        req.send(null);
                                    })];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, files_1 = files;
                    _a.label = 1;
                case 1:
                    if (!(_i < files_1.length)) return [3 /*break*/, 4];
                    file = files_1[_i];
                    return [5 /*yield**/, _loop_1(file)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, Promise.resolve(data)];
            }
        });
    });
}
//call all the functions needed
readFiles().then(function (value) {
    var tree = generateTree(value);
    //tree.print();
    // let condition: constrain = processCondition(value);
    InitializeVilillane(tree);
});
//From the raw data to generate the context-free grammar trees for the map
function generateTree(data) {
    var Prefix = data['Prefix.csv'];
    var newRule = {};
    var rawRule = data['cfgGramma.csv'];
    for (var i = 0; i < rawRule.length; i++) {
        var rows = rawRule[i].split(',');
        newRule[rows[0]] = rows[1];
    }
    return new cfgTrees('#University Map$', newRule, Prefix, '');
}
//For each elements of context free grammar, generate a random number of certain type
// of buildings according to the minimum and maximum
function processRand(data) {
    var children = data.split(';');
    var result = [];
    for (var j = 0; j < children.length; j++) {
        var elements = children[j].split('.');
        var num = scripting_1.getRandNumber(Number(elements[1]), Number(elements[2]));
        for (var k = 0; k < num; k++) {
            result.push(elements[0]);
        }
    }
    return result;
}
//Randomly generate a connected graphs from a list of nodes
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
        if (util_1.isUndefined(nodes[location[i]])) {
            nodes[location[i]] = [];
        }
        for (var j = i + 1; j < location.length; j++) {
            if (util_1.isUndefined(nodes[location[j]])) {
                nodes[location[j]] = [];
            }
            if (Math.random() < (2 / location.length)) {
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
function InitializeVilillane(Tree) {
    //get assortDict for NPC constraint
    var assortDict = Tree.getAssortedDict();
    //get itemList for display items
    var itemsList = Tree.getItemsList();
    //get expandList to generate a expand graph
    var expandList = Tree.getExpandList();
    //get the initialized id pair
    var idLabelPair = Tree.getIdLabelPair();
    //get the initialized prevname pairs
    var PrevnameList = Tree.getPrevnameList();
    // agents
    var NPC = scripting_1.addAgent("Alien");
    //items
    for (var _i = 0, _a = Object.keys(itemsList); _i < _a.length; _i++) {
        var key = _a[_i];
        for (var i = 0; i < itemsList[key].length; i++) {
            scripting_1.addItem(itemsList[key][i]);
            scripting_1.setItemVariable(itemsList[key][i], "currentLocation", key);
        }
    }
    //Generate the expandGraph from the modified expandList
    //For each expandable location, the dictionary contains a randomly connected graph for all its children
    var expandGraph = {};
    for (var _b = 0, _c = Object.keys(expandList); _b < _c.length; _b++) {
        var keys = _c[_b];
        expandGraph[keys] = connectNodes(expandList[keys]);
    }
    //Add locations to vilanelle
    function addLocationGraph(graph) {
        for (var key in graph) {
            if (key !== Tree.getValue()) {
                scripting_1.addLocation(key, graph[key]);
            }
        }
    }
    addLocationGraph(expandList);
    for (var key in expandGraph) {
        addLocationGraph(expandGraph[key]);
    }
    //Initialize locations to assign items and agent
    var locations = Object.keys(scripting_1.locationGraph);
    //Initialize player to be at one of the entrance of all universities
    var allUniversity = expandList[Tree.getValue()];
    // variables
    var itemDisplay = scripting_1.setVariable("itemDisplay", false);
    var inventory = scripting_1.setVariable("inventory", []);
    var selected = scripting_1.setVariable("selected", false);
    var endGame = scripting_1.setVariable("endGame", false);
    var selectedUniversity = scripting_1.setVariable("selectedUniversity", false);
    var meet = scripting_1.setVariable("meet", false);
    //NPC
    scripting_1.setAgentVariable(NPC, "currentLocation", retRand(locations));
    //player
    var playerLocation = scripting_1.setVariable("playerLocation", retRand(allUniversity));
    // 2. Define BTs
    //recover the array of all universities and location
    locations = Object.keys(scripting_1.locationGraph);
    allUniversity = expandList[Tree.getValue()];
    var setRandNumber = scripting_1.action(function () { return true; }, function () {
        scripting_1.setVariable("randNumber", scripting_1.getRandNumber(1, locations.length));
    }, 0);
    //Initialize behavior tree for NPCs
    var BTlist = [];
    var _loop_2 = function (i) {
        //console.log(locations[i]);
        var actions = scripting_1.action(function () { return scripting_1.getVariable("randNumber") == i + 1; }, function () { return scripting_1.setVariable("destination", locations[i]); }, 0);
        BTlist.push(actions);
    };
    for (var i = 0; i < locations.length; i++) {
        _loop_2(i);
    }
    var atDestination = function () { return scripting_1.getVariable("destination") == scripting_1.getAgentVariable(NPC, "currentLocation"); };
    var setDestinationPrecond = function () { return scripting_1.isVariableNotSet("destination") || atDestination(); };
    // create behavior trees
    var setNextDestination = scripting_1.sequence([
        setRandNumber,
        scripting_1.selector(BTlist),
    ]);
    var gotoNextLocation = scripting_1.action(function () { return true; }, function () {
        scripting_1.setAgentVariable(NPC, "currentLocation", scripting_1.getNextLocation(scripting_1.getAgentVariable(NPC, "currentLocation"), scripting_1.getVariable("destination")));
        console.log("Alien is at: " + scripting_1.getAgentVariable(NPC, "currentLocation"));
    }, 0);
    var setRandNumber_2 = scripting_1.action(function () { return true; }, function () {
        scripting_1.setVariable("randNumber", scripting_1.getRandNumber(1, 3));
    }, 0);
    var meetPlayer = scripting_1.sequence([setRandNumber_2,
        scripting_1.guard(function () { return scripting_1.getAgentVariable(NPC, "currentLocation") == scripting_1.getVariable(playerLocation); }, scripting_1.selector([
            scripting_1.action(function () { return scripting_1.getVariable("randNumber") == 1; }, function () {
                scripting_1.setVariable('endMethod', 'love');
                scripting_1.setVariable(selectedUniversity, get_uni(scripting_1.getVariable(playerLocation)));
                scripting_1.setVariable(endGame, true);
            }, 0),
            scripting_1.action(function () { return scripting_1.getVariable("randNumber") == 2; }, function () {
                scripting_1.setVariable('endMethod', 'die');
                scripting_1.setVariable(endGame, true);
            }, 0),
            scripting_1.action(function () { return scripting_1.getVariable("randNumber") == 3; }, function () {
                return scripting_1.setVariable(meet, true);
            }, 0)
        ]))]);
    var search = scripting_1.sequence([
        scripting_1.selector([
            scripting_1.guard(setDestinationPrecond, setNextDestination),
            scripting_1.action(function () { return true; }, function () {
            }, 0)
        ]),
        gotoNextLocation,
    ]);
    var NPCBT = scripting_1.selector([
        meetPlayer,
        scripting_1.sequence([
            search, meetPlayer
        ])
    ]);
    //attach behaviour trees to agents
    scripting_1.attachTreeToAgent(NPC, NPCBT);
    //a function to determine which university the current location is in
    function get_uni(loc) {
        var uni = loc;
        while (PrevnameList[uni] != Tree.getValue()) {
            uni = PrevnameList[uni];
        }
        return uni;
    }
    var _loop_3 = function (key) {
        var seq = [];
        seq.push(scripting_1.displayDescriptionAction("You enter the " + idLabelPair[key] + "."));
        seq.push(scripting_1.addUserAction("Select University.", function () { return scripting_1.setVariable(selected, true); }));
        seq.push(scripting_1.addUserAction("Stay where you are.", function () {
        }));
        //Check whether it's in a lower layer
        if (Object.keys(scripting_1.locationGraph).includes(PrevnameList[key])) {
            seq.push(scripting_1.addUserAction("Go outside to " + idLabelPair[PrevnameList[key]] + ".", function () {
                scripting_1.setVariable(playerLocation, PrevnameList[key]);
            }));
        }
        //Check whether it's has a children
        if (Object.keys(expandList).includes(key)) {
            seq.push(scripting_1.addUserAction("Go inside " + idLabelPair[key] + " to enter " + idLabelPair[expandList[key][0]] + ".", function () { return scripting_1.setVariable(playerLocation, expandList[key][0]); }));
        }
        var graph = completeGraph(expandGraph[PrevnameList[key]]);
        var _loop_7 = function (adj) {
            seq.push(scripting_1.addUserAction("Enter the " + idLabelPair[adj] + ".", function () { return scripting_1.setVariable(playerLocation, adj); }));
        };
        for (var _i = 0, _a = graph[key]; _i < _a.length; _i++) {
            var adj = _a[_i];
            _loop_7(adj);
        }
        var StateBT = scripting_1.guard(function () { return scripting_1.getVariable(playerLocation) == key &&
            scripting_1.getVariable(itemDisplay) == false &&
            scripting_1.getVariable(selected) == false &&
            scripting_1.getVariable(endGame) == false; }, scripting_1.sequence(seq));
        scripting_1.addUserInteractionTree(StateBT);
    };
    // 3. Construct story
    // create user actions from the graphs
    for (var key in scripting_1.locationGraph) {
        _loop_3(key);
    }
    var _loop_4 = function (i) {
        var showItemBT = scripting_1.guard(function () { return scripting_1.getVariable(playerLocation) == scripting_1.getItemVariable(scripting_1.items[i], "currentLocation")
            && scripting_1.getVariable(itemDisplay) == true; }, scripting_1.sequence([
            scripting_1.addUserAction("Pick up the " + scripting_1.items[i] + ".", function () {
                scripting_1.setVariable(itemDisplay, false);
                var curInv = scripting_1.getVariable(inventory);
                curInv.push(scripting_1.items[i]);
                itemsList[scripting_1.getVariable(playerLocation)].splice(itemsList[scripting_1.getVariable(playerLocation)].indexOf(scripting_1.items[i]), 1);
                scripting_1.displayActionEffectText("You pick up the " + scripting_1.items[i] + ".");
                scripting_1.setItemVariable(scripting_1.items[i], "currentLocation", "player");
                scripting_1.setVariable(inventory, curInv);
            })
        ]));
        scripting_1.addUserInteractionTree(showItemBT);
    };
    //Create behavior trees for every items
    for (var i = 0; i < scripting_1.items.length; i++) {
        _loop_4(i);
    }
    var universitySeq = [];
    var _loop_5 = function (i) {
        universitySeq.push(scripting_1.addUserAction("select " + allUniversity[i] + ".", function () {
            scripting_1.setVariable(selectedUniversity, allUniversity[i]);
            scripting_1.setVariable('endMethod', 'select');
            scripting_1.setVariable(endGame, true);
        }));
    };
    for (var i = 0; i < allUniversity.length; i++) {
        _loop_5(i);
    }
    var universityBT = scripting_1.guard(function () { return scripting_1.getVariable(selected) == true && scripting_1.getVariable(endGame) == false; }, scripting_1.sequence(universitySeq));
    scripting_1.addUserInteractionTree(universityBT);
    var meetBT = scripting_1.guard(function () { return scripting_1.getVariable(meet) == true; }, scripting_1.sequence([
        scripting_1.action(function () { return true; }, function () { return scripting_1.setVariable(meet, false); }, 0),
        scripting_1.displayDescriptionAction("Nothing happens between you and the stranger")
    ]));
    scripting_1.addUserInteractionTree(meetBT);
    var _loop_6 = function (i) {
        var rand = Math.random();
        if (rand < 0.1) {
            var brokenBT = scripting_1.guard(function () { return scripting_1.getVariable(playerLocation) == locations[i] &&
                scripting_1.getVariable(itemDisplay) == false &&
                scripting_1.getVariable(selected) == false &&
                scripting_1.getVariable(endGame) == false; }, scripting_1.sequence([
                scripting_1.displayDescriptionAction('The place you enter is broken!')
            ]));
            scripting_1.addUserInteractionTree(brokenBT);
        }
        else if (rand < 0.2) {
            var fancyBT = scripting_1.guard(function () { return scripting_1.getVariable(playerLocation) == locations[i] &&
                scripting_1.getVariable(itemDisplay) == false &&
                scripting_1.getVariable(selected) == false &&
                scripting_1.getVariable(endGame) == false; }, scripting_1.sequence([
                scripting_1.displayDescriptionAction('The place you enter is fancy!')
            ]));
            scripting_1.addUserInteractionTree(fancyBT);
        }
    };
    for (var i = 0; i < locations.length; i++) {
        _loop_6(i);
    }
    var gameOver = scripting_1.guard(function () { return scripting_1.getVariable(endGame) == true; }, scripting_1.selector([
        scripting_1.action(function () { return scripting_1.getVariable('endMethod') == 'select'; }, function () {
            userInteractionObject.text += "\n" + "You decide to go to " + scripting_1.getVariable(selectedUniversity) + "!";
        }, 0),
        scripting_1.action(function () { return scripting_1.getVariable('endMethod') == 'love'; }, function () {
            userInteractionObject.text += "\n" + "You fall in love with the one you met, finally decide go to " +
                scripting_1.getVariable(selectedUniversity) + '!';
        }, 0),
        scripting_1.guard(function () { return scripting_1.getVariable('endMethod') == 'die'; }, scripting_1.displayDescriptionAction("Sadly, You are killed by the stranger you meet!"))
    ]));
    scripting_1.addUserInteractionTree(gameOver);
    //Initialize sigma for player and NPC
    var sigmaPlayer = new sigma({
        graph: {
            nodes: [],
            edges: []
        },
        renderer: {
            type: 'canvas',
            container: 'player-container'
        },
        settings: {
            nodeBorderSize: 5,
            defaultNodeBorderColor: '#fff',
            defaultNodeHoverBorderColor: '#fff',
            defaultNodeColor: '#000',
            defaultLabelColor: '#fff',
            defaultEdgeColor: '#fff',
            edgeColor: 'default',
            maxNodeSize: 20,
            sideMargin: 15
        }
    });
    var sigmaAlien = new sigma({
        graph: {
            nodes: [],
            edges: []
        },
        renderer: {
            type: 'canvas',
            container: 'NPC-container'
        },
        settings: {
            nodeBorderSize: 5,
            defaultNodeBorderColor: '#fff',
            defaultNodeColor: '#000',
            defaultLabelColor: '#fff',
            defaultEdgeColor: '#fff',
            edgeColor: 'default',
            maxNodeSize: 20,
            sideMargin: 15
        }
    });
    //A unique ID for each edge.
    var edgeID = 0;
    //Clear the graph.
    function clear(sigma) {
        var nodes = sigma.graph.nodes();
        for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
            var node = nodes_1[_i];
            sigma.graph.dropNode(node.id);
        }
    }
    //The graph generate by connect-node is one direction
    //This function make it two-direction
    function completeGraph(graph) {
        var retGraph = {};
        for (var key in graph) {
            if (util_1.isUndefined(retGraph[key])) {
                retGraph[key] = [];
            }
            retGraph[key] = retGraph[key].concat(graph[key]);
            for (var _i = 0, _a = graph[key]; _i < _a.length; _i++) {
                var loc = _a[_i];
                if (util_1.isUndefined(retGraph[loc])) {
                    retGraph[loc] = [];
                }
                retGraph[loc].push(key);
            }
        }
        return retGraph;
    }
    //Show the adjacent node of the input node
    function showAround(input, sigmaInstance) {
        var graph = completeGraph(expandGraph[PrevnameList[input]]);
        var adjacent = graph[input];
        var numberLayer = adjacent.length;
        if (util_1.isUndefined(sigmaInstance.graph.nodes(input))) {
            sigmaInstance.graph.addNode({
                // Main attributes:
                id: input,
                label: idLabelPair[input],
                x: 0,
                y: 0,
                size: 15
            });
        }
        for (var i = 0; i < numberLayer; i++) {
            if (util_1.isUndefined(sigmaInstance.graph.nodes(adjacent[i]))) {
                sigmaInstance.graph.addNode({
                    // Main attributes:
                    id: adjacent[i],
                    label: idLabelPair[adjacent[i]],
                    x: Math.cos(Math.PI * 2 * (i - 1 / 3) / numberLayer) * 40 + sigmaInstance.graph.nodes(input).x,
                    y: Math.sin(Math.PI * 2 * (i - 1 / 3) / numberLayer) * 40 + sigmaInstance.graph.nodes(input).y,
                    size: 15
                });
            }
            sigmaInstance.graph.addEdge({
                id: 'edge' + (edgeID++).toString(),
                source: adjacent[i],
                target: sigmaInstance.graph.nodes(input).id,
                size: 1,
                color: "#fff"
            });
        }
    }
    function show(inputid, sigmaInstance) {
        var graph = completeGraph(expandGraph[PrevnameList[inputid]]);
        var adjacent = graph[inputid];
        var numberLayer = adjacent.length;
        showAround(inputid, sigmaInstance);
        //Show additional nodes if all the node in this layer is small enough
        if (Object.keys(graph).length < 10) {
            for (var _i = 0, adjacent_1 = adjacent; _i < adjacent_1.length; _i++) {
                var layer1 = adjacent_1[_i];
                showAround(layer1, sigmaInstance);
                var newAdjacent = graph[layer1];
                for (var _a = 0, newAdjacent_1 = newAdjacent; _a < newAdjacent_1.length; _a++) {
                    var layer2 = newAdjacent_1[_a];
                    showAround(layer2, sigmaInstance);
                }
            }
        }
    }
    //for dragging the nodes.
    var dragListener1 = sigma.plugins.dragNodes(sigmaPlayer, sigmaPlayer.renderers[0]);
    dragListener1.bind('startdrag', function (event) {
        console.log(event);
    });
    dragListener1.bind('drag', function (event) {
        console.log(event);
    });
    dragListener1.bind('drop', function (event) {
        console.log(event);
    });
    dragListener1.bind('dragend', function (event) {
        console.log(event);
    });
    var dragListener2 = sigma.plugins.dragNodes(sigmaAlien, sigmaAlien.renderers[0]);
    dragListener2.bind('startdrag', function (event) {
        console.log(event);
    });
    dragListener2.bind('drag', function (event) {
        console.log(event);
    });
    dragListener2.bind('drop', function (event) {
        console.log(event);
    });
    dragListener2.bind('dragend', function (event) {
        console.log(event);
    });
    //4. Run the world
    scripting_1.initialize();
    var userInteractionObject = scripting_1.getUserInteractionObject();
    //RENDERING-----
    //let displayPanel = {x: 500, y: 0};
    var textPanel = { x: 450, y: 350 };
    var actionsPanel = { x: 470, y: 375 };
    function render() {
        //for all the parents locations of the agents
        var NPCPrevs = [];
        var playerPrevs = [];
        var AlienPrevLocs;
        var PlayerPrevLocs;
        //get agents' current location
        var NPCLocation = scripting_1.getAgentVariable(NPC, "currentLocation");
        var playerL = scripting_1.getVariable(playerLocation);
        //generate all the parents locations of the NPC
        AlienPrevLocs = PrevnameList[NPCLocation];
        while (AlienPrevLocs != Tree.getValue()) {
            NPCPrevs.push(AlienPrevLocs);
            AlienPrevLocs = PrevnameList[AlienPrevLocs];
        }
        //make sure the game is not ended.
        if (Object.keys(scripting_1.locationGraph).includes(playerL)) {
            //generate all the parents locations of the player
            PlayerPrevLocs = PrevnameList[playerL];
            while (PlayerPrevLocs != Tree.getValue()) {
                playerPrevs.push(PlayerPrevLocs);
                PlayerPrevLocs = PrevnameList[PlayerPrevLocs];
            }
            clear(sigmaPlayer);
            clear(sigmaAlien);
            show(playerL, sigmaPlayer);
            show(NPCLocation, sigmaAlien);
            var playerText = document.getElementsByClassName("lefttext");
            var playerinnerHtml = '';
            for (var i = 0; i <= playerPrevs.length; i++) {
                playerinnerHtml += '<span class="playerdot"></span>';
            }
            if (PrevnameList[playerL] == Tree.getValue()) {
                playerinnerHtml += '  ' + Tree.getValue() + '/';
            }
            else {
                playerinnerHtml += '  ' + PrevnameList[PrevnameList[playerL]] + '/';
                playerinnerHtml += PrevnameList[playerL] + '/';
            }
            playerText[0].innerHTML = playerinnerHtml;
            var AgentText = document.getElementsByClassName("righttext");
            var AgentinnerHtml = '';
            for (var i = 0; i <= NPCPrevs.length; i++) {
                AgentinnerHtml += '<span class="agentdot"></span>';
            }
            if (PrevnameList[NPCLocation] == Tree.getValue()) {
                AgentinnerHtml += '  ' + Tree.getValue() + '/';
            }
            else {
                AgentinnerHtml += '  ' + PrevnameList[PrevnameList[NPCLocation]] + '/';
                AgentinnerHtml += PrevnameList[NPCLocation] + '/';
            }
            AgentText[0].innerHTML = AgentinnerHtml;
        }
        else {
            clear(sigmaAlien);
            clear(sigmaPlayer);
            sigmaPlayer.refresh();
            sigmaAlien.refresh();
            //show(NPCLocation, sigmaAlien);
        }
        //show the locations of player and agents on the graph
        //the image of boy from http://www.urltarget.com/icon-symbol-people-boy-man-male-cartoon-scout.html
        for (var _i = 0, _a = sigmaPlayer.graph.nodes(); _i < _a.length; _i++) {
            var node = _a[_i];
            if (node.id == NPCLocation) {
                node.image = { url: '../images/boy.png' };
            }
            if (node.id == playerL) {
                node.image = { url: '../images/player2.png' };
            }
            if (NPCPrevs.includes(node.id)) {
                node.border_color = '#ff0000';
            }
            if (!util_1.isUndefined(itemsList[node.id]) && itemsList[node.id].length != 0) {
                node.border_color = '#0000FF';
            }
        }
        for (var _b = 0, _c = sigmaAlien.graph.nodes(); _b < _c.length; _b++) {
            var node = _c[_b];
            if (node.id == playerL) {
                node.image = { url: '../images/player2.png' };
            }
            if (node.id == NPCLocation) {
                node.image = { url: '../images/boy.png' };
            }
            if (playerPrevs.includes(node.id)) {
                node.border_color = '#ADFF2F';
            }
        }
        sigmaPlayer.refresh();
        sigmaAlien.refresh();
        var config = {
            nodeMargin: 50,
            gridSize: 5
        };
        //algorithm for no lapping layout.
        //Configure the algorithm
        var listener1 = sigmaPlayer.configNoverlap(config);
        var listener2 = sigmaAlien.configNoverlap(config);
        //Bind all events:
        listener1.bind('start stop interpolate', function (event) {
            console.log(event.type);
        });
        listener2.bind('start stop interpolate', function (event) {
            console.log(event.type);
        });
        //Start the algorithm:
        sigmaPlayer.startNoverlap();
        sigmaAlien.startNoverlap();
        displayTextAndActions();
    }
    var canvas = document.getElementById('display');
    var context = canvas.getContext('2d');
    var currentSelection;
    var yOffset = actionsPanel.y + 25;
    var yOffsetIncrement = 30;
    function displayTextAndActions() {
        context.clearRect(textPanel.x, textPanel.y, 1000, 1000);
        yOffset = actionsPanel.y + 25;
        context.font = "15pt Calibri";
        context.fillStyle = 'white';
        console.log("Actions effect text: " + userInteractionObject.actionEffectsText);
        var textToDisplay = userInteractionObject.actionEffectsText.length != 0 ? userInteractionObject.actionEffectsText : userInteractionObject.text;
        context.fillText(textToDisplay, textPanel.x, textPanel.y + 20);
        context.font = "15pt Calibri";
        context.fillStyle = 'white';
        for (var i = 0; i < userInteractionObject.userActionsText.length; i++) {
            var userActionText = userInteractionObject.userActionsText[i];
            context.fillText(userActionText, actionsPanel.x + 20, yOffset);
            if (i == 0) {
                currentSelection = i;
            }
            yOffset += yOffsetIncrement;
        }
        displayArrow();
    }
    function displayArrow() {
        if (userInteractionObject.userActionsText.length != 0) {
            context.clearRect(actionsPanel.x, actionsPanel.y, 20, 1000);
            context.fillText("> ", 470, actionsPanel.y + 25 + (currentSelection * yOffsetIncrement));
        }
    }
    //User input
    function keyPress(e) {
        if (e.keyCode == 13) {
            var selectedAction = userInteractionObject.userActionsText[currentSelection];
            if (!util_1.isUndefined(selectedAction)) {
                scripting_1.executeUserAction(selectedAction);
                scripting_1.worldTick();
                render();
            }
        }
    }
    function keyDown(e) {
        if (e.keyCode == 40) { //down
            if (userInteractionObject.userActionsText.length != 0) {
                currentSelection++;
                currentSelection = currentSelection % userInteractionObject.userActionsText.length;
                displayArrow();
            }
        }
        else if (e.keyCode == 38) { //up
            if (userInteractionObject.userActionsText.length != 0) {
                currentSelection--;
                if (currentSelection < 0)
                    currentSelection = userInteractionObject.userActionsText.length - 1;
                displayArrow();
            }
        }
    }
    render();
    document.addEventListener("keypress", keyPress, false);
    document.addEventListener("keydown", keyDown, false);
}
