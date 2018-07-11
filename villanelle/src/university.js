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
var files = ["../data/University/University.csv",
    "../data/University/Prefix.csv"];
var sigma = require('sigma');
window.sigma = sigma;
require('sigma/plugins/sigma.plugins.dragNodes/sigma.plugins.dragNodes');
require('sigma/plugins/sigma.plugins.animate/sigma.plugins.animate');
require('sigma/plugins/sigma.layout.noverlap/sigma.layout.noverlap');
require('sigma/src/middlewares/sigma.middlewares.rescale');
//function for random color
//Taken from https://stackoverflow.com/questions/1484506/random-color-generator
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
        var data, rows, BuildingList, PrefixList, returnList, _i, files_1, file, value, i, key, j, index;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    data = [];
                    BuildingList = {};
                    PrefixList = [];
                    returnList = [];
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
                                        data.push(lines);
                                        resolve(lines);
                                    }
                                    else {
                                        reject(Error(req.statusText));
                                    }
                                }
                            };
                            req.open("GET", file, true);
                            req.responseType = "text";
                            req.send(null);
                        })];
                case 2:
                    value = _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    for (i = 0; i < data[0].length; i++) {
                        rows = data[0][i].split(',');
                        BuildingList[rows[0]] = scripting_1.getRandNumber(Number(rows[1]), Number(rows[2]));
                    }
                    PrefixList = data[1];
                    for (key in BuildingList) {
                        for (j = 0; j < BuildingList[key]; j++) {
                            if (key != "Exit") {
                                index = scripting_1.getRandNumber(0, PrefixList.length - 1);
                                returnList.push(PrefixList[index] + " " + key);
                                PrefixList.splice(index, 1);
                            }
                            else {
                                returnList.push(key);
                            }
                        }
                    }
                    return [2 /*return*/, Promise.resolve(returnList)];
            }
        });
    });
}
readFiles().then(function (value) {
    var Graph = connectNodes(value);
    InitializeVilillane(Graph);
});
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
            if (Math.random() < 0.06) {
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
function visualize(Graph) {
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
    var edgeID = 0;
    for (var locations in Graph) {
        sigmaInstance.graph.addNode({
            // Main attributes:
            id: locations,
            label: locations,
            x: Math.random(),
            y: Math.random(),
            size: 17,
            borderColor: getRandomColor()
        });
    }
    for (var locations in Graph) {
        var adjacent = Graph[locations];
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
    sigmaInstance.refresh();
    var config = {
        nodeMargin: 20,
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
}
function InitializeVilillane(Graph) {
    for (var key in Graph) {
        scripting_1.addLocation(key, Graph[key]);
    }
    var locations = Object.keys(Graph);
    // agents
    var alien = scripting_1.addAgent("Alien");
    // items
    var randomLocation = [];
    for (var i = 0; i < 4; i++) {
        //-2 because we don't want anything to be on the exit
        var index = scripting_1.getRandNumber(0, locations.length - 2);
        randomLocation.push(locations[index]);
        locations.splice(index, 1);
    }
    console.log("loc1:" + randomLocation[0]);
    console.log("loc2:" + randomLocation[1]);
    var crewCard1 = scripting_1.addItem("Crew card1");
    var crewCard2 = scripting_1.addItem("Crew card2");
    scripting_1.setItemVariable(crewCard1, "currentLocation", randomLocation[0]);
    scripting_1.setItemVariable(crewCard2, "currentLocation", randomLocation[1]);
    // variables
    //alien
    scripting_1.setAgentVariable(alien, "currentLocation", randomLocation[2]);
    //player
    var playerLocation = scripting_1.setVariable("playerLocation", randomLocation[3]);
    var crewCardsCollected = scripting_1.setVariable("crewCardsCollected", 0);
    // 2. Define BTs
    // create ground actions
    //Recover location array
    locations = Object.keys(Graph);
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
    var _loop_2 = function (key) {
        var seq = [];
        seq.push(scripting_1.displayDescriptionAction("You enter the " + key + "."));
        seq.push(scripting_1.addUserAction("Stay where you are.", function () { }));
        var _loop_3 = function (adj_1) {
            seq.push(scripting_1.addUserAction("Enter the " + adj_1 + ".", function () { return scripting_1.setVariable(playerLocation, adj_1); }));
        };
        for (var _i = 0, _a = scripting_1.locationGraph[key]; _i < _a.length; _i++) {
            var adj_1 = _a[_i];
            _loop_3(adj_1);
        }
        StateBT = scripting_1.guard(function () { return scripting_1.getVariable(playerLocation) == key; }, scripting_1.sequence(seq));
        scripting_1.addUserInteractionTree(StateBT);
    };
    var StateBT;
    // 3. Construct story
    // create user actions
    for (var key in scripting_1.locationGraph) {
        _loop_2(key);
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
    var edgeID = 0;
    for (var locs in Graph) {
        sigmaInstance.graph.addNode({
            // Main attributes:
            id: locs,
            label: locs,
            x: Math.random(),
            y: Math.random(),
            size: 17,
            borderColor: getRandomColor()
        });
    }
    for (var locs in Graph) {
        var adjacent = Graph[locs];
        for (var _i = 0, adjacent_2 = adjacent; _i < adjacent_2.length; _i++) {
            var adj = adjacent_2[_i];
            sigmaInstance.graph.addEdge({
                id: 'e' + (edgeID++).toString(),
                source: locs,
                target: adj,
                size: 10
            });
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
        for (var _i = 0, _a = sigmaInstance.graph.nodes(); _i < _a.length; _i++) {
            var node = _a[_i];
            node.color = '#000';
        }
        sigmaInstance.graph.nodes(alienLocation).color = '#0efa76';
        if (!util_1.isUndefined(sigmaInstance.graph.nodes(playerL))) {
            sigmaInstance.graph.nodes(playerL).color = '#f0f';
        }
        sigmaInstance.refresh();
        var config = {
            nodeMargin: 20,
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
