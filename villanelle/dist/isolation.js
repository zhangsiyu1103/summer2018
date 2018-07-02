"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/* /// <reference path="scripting.ts"/> */
const scripting_1 = require("./scripting");
const util_1 = require("typescript-collections/dist/lib/util");
let files = ["../data/university.csv", "../data/LastNames.csv"];
let sigma = require('sigma');
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
    return __awaiter(this, void 0, void 0, function* () {
        let data = [];
        let rows;
        let BuildingList = {};
        let PrefixList = [];
        let returnList = [];
        for (var file of files) {
            let value = yield new Promise(function (resolve, reject) {
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
            });
        }
        for (let i = 0; i < data[0].length; i++) {
            rows = data[0][i].split(',');
            BuildingList[rows[0]] = scripting_1.getRandNumber(Number(rows[1]), Number(rows[2]));
        }
        PrefixList = data[1];
        for (var key in BuildingList) {
            for (let j = 0; j < BuildingList[key]; j++) {
                let index = scripting_1.getRandNumber(0, PrefixList.length - 1);
                returnList.push(PrefixList[index] + " " + key);
                PrefixList.splice(index, 1);
            }
        }
        return Promise.resolve(returnList);
    });
}
readFiles().then(function (value) {
    var Graph = connectNodes(value);
    InitializeVilillane(Graph);
});
function connectNodes(location) {
    let nodes = {};
    let visited = {};
    for (let i = 0; i < location.length; i++) {
        visited[location[i]] = false;
    }
    let stack = [];
    let rest = [];
    //randomly generate a graph
    for (let i = 0; i < location.length; i++) {
        if ((typeof nodes[location[i]]) === 'undefined') {
            nodes[location[i]] = [];
        }
        for (let j = i + 1; j < location.length; j++) {
            if ((typeof nodes[location[j]]) === 'undefined') {
                nodes[location[j]] = [];
            }
            if (Math.random() < 0.1) {
                nodes[location[i]].push(location[j]);
            }
        }
    }
    //making sure it is connected
    for (let i = 0; i < location.length; i++) {
        if (visited[location[i]] == false) {
            let item = location[i];
            stack.push(location[i]);
            while (stack.length > 0) {
                var cur = stack.pop();
                if (cur !== undefined) {
                    if (visited[cur] == false) {
                        visited[cur] = true;
                        if (Math.random() < 0.3) {
                            item = cur;
                        }
                        for (let val of nodes[cur]) {
                            stack.push(val);
                        }
                    }
                }
            }
            rest.push(item);
        }
    }
    console.log(rest);
    for (let i = 0; i < rest.length - 1; i++) {
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
        let adjacent = Graph[locations];
        for (var adj of adjacent) {
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
function InitializeVilillane(Graph) {
    for (let key in Graph) {
        scripting_1.addLocation(key, Graph[key]);
    }
    var locations = Object.keys(Graph);
    // agents
    var alien = scripting_1.addAgent("Alien");
    // items
    var randomLocation = [];
    for (let i = 0; i < 4; i++) {
        var index = scripting_1.getRandNumber(0, locations.length - 1);
        randomLocation.push(locations[index]);
        locations.splice(index, 0);
    }
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
    let setRandNumber = scripting_1.action(() => true, () => scripting_1.setVariable("randNumber", scripting_1.getRandNumber(1, 18)), 0);
    var BTlist = [];
    var id = 0;
    //Recover location array
    locations = Object.keys(Graph);
    for (var key of locations) {
        let actions = scripting_1.action(() => scripting_1.getVariable("randNumber") == id, () => scripting_1.setVariable("destination", key), 0);
        BTlist.push(actions);
        id++;
    }
    let atDestination = () => scripting_1.getVariable("destination") == scripting_1.getAgentVariable(alien, "currentLocation");
    let setDestinationPrecond = () => scripting_1.isVariableNotSet("destination") || atDestination();
    // create behavior trees
    let setNextDestination = scripting_1.sequence([
        setRandNumber,
        scripting_1.selector(BTlist)
    ]);
    let gotoNextLocation = scripting_1.action(() => true, () => {
        scripting_1.setAgentVariable(alien, "currentLocation", scripting_1.getNextLocation(scripting_1.getAgentVariable(alien, "currentLocation"), scripting_1.getVariable("destination")));
        console.log("Alien is at: " + scripting_1.getAgentVariable(alien, "currentLocation"));
    }, 0);
    let eatPlayer = scripting_1.action(() => scripting_1.getAgentVariable(alien, "currentLocation") == scripting_1.getVariable(playerLocation), () => {
        scripting_1.setVariable("endGame", "lose");
        scripting_1.setVariable(playerLocation, "NA");
    }, 0);
    let search = scripting_1.sequence([
        scripting_1.selector([
            scripting_1.guard(setDestinationPrecond, setNextDestination),
            scripting_1.action(() => true, () => {
            }, 0)
        ]),
        gotoNextLocation,
    ]);
    let alienBT = scripting_1.selector([
        eatPlayer,
        scripting_1.sequence([
            search, eatPlayer
        ])
    ]);
    //attach behaviour trees to agents
    scripting_1.attachTreeToAgent(alien, alienBT);
    // 3. Construct story
    // create user actions
    for (let key in Graph) {
        let seq = [];
        seq.push(scripting_1.displayDescriptionAction("You enter the " + key + "."));
        for (let adj of Graph[key]) {
            seq.push(scripting_1.addUserAction("Enter the " + adj, () => scripting_1.setVariable(playerLocation, adj)));
        }
        seq.push(scripting_1.addUserAction("Stay where you are.", () => {
        }));
        var StateBT = scripting_1.guard(() => scripting_1.getVariable(playerLocation) == key, scripting_1.sequence(seq));
        scripting_1.addUserInteractionTree(StateBT);
    }
    var crewCard1BT = scripting_1.guard(() => scripting_1.getVariable(playerLocation) == scripting_1.getItemVariable(crewCard1, "currentLocation"), scripting_1.sequence([
        scripting_1.displayDescriptionAction("You notice a crew card lying around."),
        scripting_1.addUserActionTree("Pick up the crew card", scripting_1.sequence([
            scripting_1.action(() => true, () => {
                scripting_1.displayActionEffectText("You pick up the crew card.");
                scripting_1.setItemVariable(crewCard1, "currentLocation", "player");
                scripting_1.setVariable(crewCardsCollected, scripting_1.getVariable(crewCardsCollected) + 1);
            }, 0),
            scripting_1.action(() => true, () => {
                scripting_1.displayActionEffectText("Wow you know how to pick up things.");
            }, 0)
        ]))
    ]));
    var crewCard2BT = scripting_1.guard(() => scripting_1.getVariable(playerLocation) == scripting_1.getItemVariable(crewCard2, "currentLocation"), scripting_1.sequence([
        scripting_1.displayDescriptionAction("You notice a crew card lying around."),
        scripting_1.addUserAction("Pick up the crew card", () => {
            scripting_1.displayActionEffectText("You pick up the crew card.");
            scripting_1.setItemVariable(crewCard2, "currentLocation", "player");
            scripting_1.setVariable(crewCardsCollected, scripting_1.getVariable(crewCardsCollected) + 1);
        })
    ]));
    scripting_1.addUserInteractionTree(crewCard1BT);
    scripting_1.addUserInteractionTree(crewCard2BT);
    var alienNearby = scripting_1.guard(() => scripting_1.areAdjacent(scripting_1.getVariable(playerLocation), scripting_1.getAgentVariable(alien, "currentLocation")), scripting_1.displayDescriptionAction("You hear a thumping sound. The alien is nearby."));
    scripting_1.addUserInteractionTree(alienNearby);
    var gameOver = scripting_1.guard(() => scripting_1.getVariable(playerLocation) == "NA", scripting_1.selector([
        scripting_1.guard(() => scripting_1.getVariable("endGame") == "win", scripting_1.displayDescriptionAction("You have managed to escape!")),
        scripting_1.guard(() => scripting_1.getVariable("endGame") == "lose", scripting_1.displayDescriptionAction("The creature grabs you before you can react! You struggle for a bit before realising it's all over.."))
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
        let adjacent = Graph[locs];
        for (var adj of adjacent) {
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
    var textPanel = { x: 400, y: 425 };
    var actionsPanel = { x: 420, y: 475 };
    function render() {
        let alienLocation = scripting_1.getAgentVariable(alien, "currentLocation");
        let playerL = scripting_1.getVariable(playerLocation);
        for (var node of sigmaInstance.graph.nodes()) {
            node.color = '#000';
        }
        sigmaInstance.graph.nodes(alienLocation).color = '#0efa76';
        if (!util_1.isUndefined(sigmaInstance.graph.nodes(playerL))) {
            sigmaInstance.graph.nodes(playerL).color = '#f0f';
        }
        sigmaInstance.refresh();
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
//# sourceMappingURL=isolation.js.map