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
/* /// <reference path="scripting.ts"/> */
var scripting_1 = require("./scripting");
var util_1 = require("typescript-collections/dist/lib/util");
var sigma = require('linkurious');
window.sigma = sigma;
require('linkurious/plugins/sigma.plugins.dragNodes/sigma.plugins.dragNodes');
require('linkurious/plugins/sigma.plugins.animate/sigma.plugins.animate');
require('linkurious/plugins/sigma.layouts.noverlap/sigma.layouts.noverlap');
require('linkurious/plugins/sigma.renderers.linkurious/canvas/sigma.canvas.nodes.def');
var filePrefix = "../data/university/";
var fileSuffix = ".csv";
var files = ["cfgGramma", "Prefix"];
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
    cfgTrees.prototype.getPrevnameList = function () {
        var PrevnameList = {};
        for (var _i = 0, _a = this.getBranchValues(); _i < _a.length; _i++) {
            var name = _a[_i];
            PrevnameList[name] = this.val;
        }
        if (this.branches != null) {
            for (var _b = 0, _c = this.branches; _b < _c.length; _b++) {
                var tree = _c[_b];
                combine(PrevnameList, tree.getPrevnameList());
            }
        }
        return PrevnameList;
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
function combine(dict1, dict2) {
    for (var _i = 0, _a = Object.keys(dict2); _i < _a.length; _i++) {
        var val = _a[_i];
        dict1[val] = dict2[val];
    }
    return dict1;
}
function retRand(list) {
    var index = scripting_1.getRandNumber(0, list.length - 1);
    var ret = list[index];
    list.splice(index, 1);
    return ret;
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
                            req.open("GET", filePrefix + file + fileSuffix, true);
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
    InitializeVilillane(tree);
});
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
            var num = scripting_1.getRandNumber(Number(elements[1]), Number(elements[2]));
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
    var expandGraph = Tree.getExpandGraph();
    var expandList = Tree.getExpandList();
    var idLabelPair = Tree.getIdLabelPair();
    var PrevnameList = Tree.getPrevnameList();
    var bool = {};
    for (var _i = 0, _a = Tree.getAllValues(); _i < _a.length; _i++) {
        var val = _a[_i];
        bool[val] = false;
    }
    //Add locations to villanelle
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
    var locations = Object.keys(scripting_1.locationGraph);
    // agents
    var alien = scripting_1.addAgent("Alien");
    // items
    var crewCard1 = scripting_1.addItem("Crew card1");
    var crewCard2 = scripting_1.addItem("Crew card2");
    scripting_1.setItemVariable(crewCard1, "currentLocation", retRand(locations));
    scripting_1.setItemVariable(crewCard2, "currentLocation", retRand(locations));
    // variables
    //alien
    scripting_1.setAgentVariable(alien, "currentLocation", retRand(locations));
    //player
    var playerLocation = scripting_1.setVariable("playerLocation", retRand(locations));
    var crewCardsCollected = scripting_1.setVariable("crewCardsCollected", 0);
    console.log(scripting_1.getVariable(playerLocation));
    // 2. Define BTs
    // create ground actions
    //Recover location array
    locations = Object.keys(scripting_1.locationGraph);
    var setRandNumber = scripting_1.action(function () { return true; }, function () {
        scripting_1.setVariable("randNumber", scripting_1.getRandNumber(1, locations.length));
    }, 0);
    var BTlist = [];
    var id = 0;
    var _loop_1 = function (i) {
        //console.log(locations[i]);
        var actions = scripting_1.action(function () { return scripting_1.getVariable("randNumber") == i + 1; }, function () { return scripting_1.setVariable("destination", locations[i]); }, 0);
        BTlist.push(actions);
    };
    for (var i = 0; i < locations.length; i++) {
        _loop_1(i);
    }
    var atDestination = function () { return scripting_1.getVariable("destination") == scripting_1.getAgentVariable(alien, "currentLocation"); };
    var setDestinationPrecond = function () { return scripting_1.isVariableNotSet("destination") || atDestination(); };
    // create behavior trees
    var setNextDestination = scripting_1.sequence([
        setRandNumber,
        scripting_1.selector(BTlist),
    ]);
    var gotoNextLocation = scripting_1.action(function () { return true; }, function () {
        scripting_1.setAgentVariable(alien, "currentLocation", scripting_1.getNextLocation(scripting_1.getAgentVariable(alien, "currentLocation"), scripting_1.getVariable("destination")));
        console.log("Alien is at: " + scripting_1.getAgentVariable(alien, "currentLocation"));
    }, 0);
    var eatPlayer = scripting_1.action(function () { return scripting_1.getAgentVariable(alien, "currentLocation") == scripting_1.getVariable(playerLocation); }, function () {
        scripting_1.setVariable("endGame", "lose");
        scripting_1.setVariable(playerLocation, "NA");
    }, 0);
    var search = scripting_1.sequence([
        scripting_1.selector([
            scripting_1.guard(setDestinationPrecond, setNextDestination),
            scripting_1.action(function () { return true; }, function () {
            }, 0)
        ]),
        gotoNextLocation,
    ]);
    var alienBT = scripting_1.selector([
        eatPlayer,
        scripting_1.sequence([
            search, eatPlayer
        ])
    ]);
    //attach behaviour trees to agents
    scripting_1.attachTreeToAgent(alien, alienBT);
    var _loop_2 = function (key_1) {
        var seq = [];
        seq.push(scripting_1.displayDescriptionAction("You enter the " + idLabelPair[key_1] + "."));
        seq.push(scripting_1.addUserAction("Stay where you are.", function () {
        }));
        if (Object.keys(scripting_1.locationGraph).includes(PrevnameList[key_1])) {
            seq.push(scripting_1.addUserAction("Go outside to " + idLabelPair[PrevnameList[key_1]] + ".", function () {
                scripting_1.setVariable(playerLocation, PrevnameList[key_1]);
            }));
        }
        if (Object.keys(expandList).includes(key_1)) {
            seq.push(scripting_1.addUserAction("Go inside " + idLabelPair[key_1] + " to enter " + idLabelPair[expandList[key_1][0]] + ".", function () { return scripting_1.setVariable(playerLocation, expandList[key_1][0]); }));
        }
        graph = completeGraph(expandGraph[PrevnameList[key_1]]);
        var _loop_3 = function (adj) {
            seq.push(scripting_1.addUserAction("Enter the " + idLabelPair[adj] + ".", function () { return scripting_1.setVariable(playerLocation, adj); }));
        };
        for (var _i = 0, _a = graph[key_1]; _i < _a.length; _i++) {
            var adj = _a[_i];
            _loop_3(adj);
        }
        StateBT = scripting_1.guard(function () { return scripting_1.getVariable(playerLocation) == key_1; }, scripting_1.sequence(seq));
        scripting_1.addUserInteractionTree(StateBT);
    };
    var graph, StateBT;
    // 3. Construct story
    // create user actions
    for (var key_1 in scripting_1.locationGraph) {
        _loop_2(key_1);
    }
    var crewCard1BT = scripting_1.guard(function () { return scripting_1.getVariable(playerLocation) == scripting_1.getItemVariable(crewCard1, "currentLocation"); }, scripting_1.sequence([
        scripting_1.displayDescriptionAction("You notice a crew card lying around."),
        scripting_1.addUserActionTree("Pick up the crew card", scripting_1.sequence([
            scripting_1.action(function () { return true; }, function () {
                scripting_1.displayActionEffectText("You pick up the crew card.");
                scripting_1.setItemVariable(crewCard1, "currentLocation", "player");
                scripting_1.setVariable(crewCardsCollected, scripting_1.getVariable(crewCardsCollected) + 1);
            }, 0),
            scripting_1.action(function () { return true; }, function () {
                scripting_1.displayActionEffectText("Wow you know how to pick up things.");
            }, 0)
        ]))
    ]));
    var crewCard2BT = scripting_1.guard(function () { return scripting_1.getVariable(playerLocation) == scripting_1.getItemVariable(crewCard2, "currentLocation"); }, scripting_1.sequence([
        scripting_1.displayDescriptionAction("You notice a crew card lying around."),
        scripting_1.addUserAction("Pick up the crew card", function () {
            scripting_1.displayActionEffectText("You pick up the crew card.");
            scripting_1.setItemVariable(crewCard2, "currentLocation", "player");
            scripting_1.setVariable(crewCardsCollected, scripting_1.getVariable(crewCardsCollected) + 1);
        })
    ]));
    var ExitBT = scripting_1.guard(function () { return scripting_1.getVariable(playerLocation) == "Exit"; }, scripting_1.selector([
        scripting_1.guard(function () { return scripting_1.getVariable(crewCardsCollected) >= 2; }, scripting_1.sequence([
            scripting_1.displayDescriptionAction("You can now activate the exit and flee!"),
            scripting_1.addUserAction("Activate and get out!", function () {
                scripting_1.setVariable("endGame", "win");
                scripting_1.setVariable(playerLocation, "NA");
            })
        ])),
        scripting_1.displayDescriptionAction("You need 2 crew cards to activate the exit elevator system.")
    ]));
    scripting_1.addUserInteractionTree(crewCard1BT);
    scripting_1.addUserInteractionTree(crewCard2BT);
    scripting_1.addUserInteractionTree(ExitBT);
    var alienNearby = scripting_1.guard(function () { return scripting_1.areAdjacent(scripting_1.getVariable(playerLocation), scripting_1.getAgentVariable(alien, "currentLocation")); }, scripting_1.displayDescriptionAction("You hear a thumping sound. The alien is nearby."));
    scripting_1.addUserInteractionTree(alienNearby);
    var gameOver = scripting_1.guard(function () { return scripting_1.getVariable(playerLocation) == "NA"; }, scripting_1.selector([
        scripting_1.guard(function () { return scripting_1.getVariable("endGame") == "win"; }, scripting_1.displayDescriptionAction("You have managed to escape!")),
        scripting_1.guard(function () { return scripting_1.getVariable("endGame") == "lose"; }, scripting_1.displayDescriptionAction("The creature grabs you before you can react! You struggle for a bit before realising it's all over.."))
    ]));
    scripting_1.addUserInteractionTree(gameOver);
    //Initialize sigma
    //for custom shapes
    //     sigma.canvas.nodes.border = function (node: any, context: any, settings: any) {
    //         var prefix = settings('prefix') || '';
    //
    //         context.fillStyle = node.color || settings('defaultNodeColor');
    //         context.beginPath();
    //         context.arc(
    //             node[prefix + 'x'],
    //             node[prefix + 'y'],
    //             node[prefix + 'size'],
    //             0,
    //             Math.PI * 2,
    //             true
    //         );
    //
    //         context.closePath();
    //         context.fill();
    //
    //         // Adding a border
    //         context.lineWidth = node.borderWidth || 2;
    //         context.strokeStyle = node.borderColor || '#fff';
    //         context.stroke();
    //     };
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
            nodeBorderSize: 3,
            defaultNodeBorderColor: '#fff',
            //defaultNodeHoverBorderColor: '#fff',
            defaultNodeColor: '#000',
            defaultLabelColor: '#fff',
            defaultEdgeColor: '#fff',
            edgeColor: 'default',
            maxNodeSize: 20,
            sideMargin: 15
        }
    });
    var edgeID = 0;
    function clear() {
        var nodes = sigmaInstance.graph.nodes();
        for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
            var node = nodes_1[_i];
            sigmaInstance.graph.dropNode(node.id);
        }
    }
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
    function showAround(input) {
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
                size: 15,
                borderColor: '#fff'
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
                    size: 15,
                    borderColor: '#fff'
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
    function show(inputid) {
        var graph = completeGraph(expandGraph[PrevnameList[inputid]]);
        var adjacent = graph[inputid];
        var numberLayer = adjacent.length;
        showAround(inputid);
        if (Object.keys(graph).length < 10) {
            for (var _i = 0, adjacent_1 = adjacent; _i < adjacent_1.length; _i++) {
                var layer1 = adjacent_1[_i];
                showAround(layer1);
                var newAdjacent = graph[layer1];
                for (var _a = 0, newAdjacent_1 = newAdjacent; _a < newAdjacent_1.length; _a++) {
                    var layer2 = newAdjacent_1[_a];
                    showAround((layer2));
                }
            }
        }
    }
    var dragListener = sigma.plugins.dragNodes(sigmaInstance, sigmaInstance.renderers[0]);
    dragListener.bind('startdrag', function (event) {
        console.log(event);
    });
    dragListener.bind('drag', function (event) {
        console.log(event);
    });
    dragListener.bind('drop', function (event) {
        console.log(event);
    });
    dragListener.bind('dragend', function (event) {
        console.log(event);
    });
    //4. Run the world
    scripting_1.initialize();
    var userInteractionObject = scripting_1.getUserInteractionObject();
    //RENDERING-----
    //var displayPanel = {x: 500, y: 0};
    var textPanel = { x: 400, y: 350 };
    var actionsPanel = { x: 420, y: 375 };
    function render() {
        var alienLocation = scripting_1.getAgentVariable(alien, "currentLocation");
        var playerL = scripting_1.getVariable(playerLocation);
        if (Object.keys(scripting_1.locationGraph).includes(playerL)) {
            clear();
            show(playerL);
        }
        for (var _i = 0, _a = sigmaInstance.graph.nodes(); _i < _a.length; _i++) {
            var node = _a[_i];
            if (node.id == alienLocation) {
                node.color = '#0efa76';
            }
            if (node.id == playerL) {
                node.color = '#f0f';
            }
        }
        sigmaInstance.refresh();
        var config = {
            nodeMargin: 50,
            gridSize: 5
        };
        //Configure the algorithm
        var listener = sigmaInstance.configNoverlap(config);
        //Bind all events:
        listener.bind('start stop interpolate', function (event) {
            console.log(event.type);
        });
        //Start the algorithm:
        sigmaInstance.startNoverlap();
        //sigmaInstance.startForceAtlas2();
        displayTextAndActions();
    }
    var canvas = document.getElementById('display');
    var context = canvas.getContext('2d');
    var currentSelection;
    var yOffset = actionsPanel.y + 25;
    var yOffsetIncrement = 50;
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
        console.log("Crew cards: " + scripting_1.getVariable(crewCardsCollected));
    }
    function displayArrow() {
        if (userInteractionObject.userActionsText.length != 0) {
            context.clearRect(actionsPanel.x, actionsPanel.y, 20, 1000);
            context.fillText("> ", 420, actionsPanel.y + 25 + (currentSelection * yOffsetIncrement));
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
