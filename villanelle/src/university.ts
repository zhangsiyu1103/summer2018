/* /// <reference path="scripting.ts"/> */
import {
    addAgent, setAgentVariable, addItem, addLocation, setVariable, getNextLocation, action,
    getRandNumber, getVariable, sequence, selector, execute, Precondition, getAgentVariable, neg_guard, guard,
    isVariableNotSet, displayDescriptionAction, addUserAction, addUserInteractionTree, initialize,
    getUserInteractionObject, executeUserAction, worldTick, attachTreeToAgent, setItemVariable, getItemVariable,
    displayActionEffectText, areAdjacent, addUserActionTree, locationGraph, Tick
} from "./scripting";
import {isUndefined} from "typescript-collections/dist/lib/util";

let files = ["../data/University/University.csv",
    "../data/University/Prefix.csv"]

let sigma = require('sigma');
(<any>window).sigma = sigma;
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

async function readFiles(): Promise<string[]> {
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
            if(key != "Exit") {
                let index = getRandNumber(0, PrefixList.length - 1);
                returnList.push(PrefixList[index] + " " + key);
                PrefixList.splice(index, 1);
            }else{
                returnList.push(key);
            }
        }
    }
    return Promise.resolve(returnList);
}

readFiles().then(function (value) {
    var Graph = connectNodes(value);
    InitializeVilillane(Graph);
})


function connectNodes(location: string[]): { [key: string]: string[] } {
    let nodes: { [key: string]: string[] } = {};
    let visited: { [key: string]: boolean } = {};
    for (let i = 0; i < location.length; i++) {
        visited[location[i]] = false;
    }
    let stack: string[] = [];
    let rest: string[] = [];

    //randomly generate a graph
    for (let i = 0; i < location.length; i++) {
        if ((typeof nodes[location[i]]) === 'undefined') {
            nodes[location[i]] = []
        }
        for (let j = i + 1; j < location.length; j++) {
            if ((typeof nodes[location[j]]) === 'undefined') {
                nodes[location[j]] = [];
            }
            if (Math.random() < 0.06) {
                nodes[location[i]].push(location[j]);
            }
        }
    }
    //making sure it is connected
    for (let i = 0; i < location.length; i++) {
        if (visited[location[i]] == false) {
            let item: string = location[i];
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
    for (let i = 0; i < rest.length - 1; i++) {
        nodes[rest[i]].push(rest[i + 1]);
    }
    return nodes;
}

function visualize(Graph: { [key: string]: string[] }) {
//for custom shapes
    sigma.canvas.nodes.border = function (node: any, context: any, settings: any) {
        var prefix = settings('prefix') || '';

        context.fillStyle = node.color || settings('defaultNodeColor');
        context.beginPath();
        context.arc(
            node[prefix + 'x'],
            node[prefix + 'y'],
            node[prefix + 'size'],
            0,
            Math.PI * 2,
            true
        );

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

    var edgeID: number = 0;

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
            })
        }
    }

    var dragListener = sigma.plugins.dragNodes(
        sigmaInstance, sigmaInstance.renderers[0]);

    dragListener.bind('startdrag', function (event: string) {
        console.log(event);
    });
    dragListener.bind('drag', function (event: string) {
        console.log(event);
    });
    dragListener.bind('drop', function (event: string) {
        console.log(event);
    });
    dragListener.bind('dragend', function (event: string) {
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
    listener.bind('start stop interpolate', function (event: any) {
        console.log(event.type);
    });

//Start the algorithm:
    sigmaInstance.startNoverlap();
}

function InitializeVilillane(Graph: { [key: string]: string[] }) {
    for (let key in Graph) {
        addLocation(key, Graph[key]);
    }
    var locations = Object.keys(Graph);

// agents
    var alien = addAgent("Alien");

// items
    var randomLocation: string[] = [];
    for (let i = 0; i < 4; i++) {
        //-2 because we don't want anything to be on the exit
        var index = getRandNumber(0, locations.length - 2);
        randomLocation.push(locations[index]);
        locations.splice(index, 1);
    }
    console.log("loc1:" + randomLocation[0]);
    console.log("loc2:" + randomLocation[1]);

    var crewCard1 = addItem("Crew card1");
    var crewCard2 = addItem("Crew card2");
    setItemVariable(crewCard1, "currentLocation", randomLocation[0]);
    setItemVariable(crewCard2, "currentLocation", randomLocation[1]);

// variables

//alien

    setAgentVariable(alien, "currentLocation", randomLocation[2]);

//player
    var playerLocation = setVariable("playerLocation", randomLocation[3]);
    var crewCardsCollected = setVariable("crewCardsCollected", 0);

// 2. Define BTs
// create ground actions

    //Recover location array
    locations = Object.keys(Graph);
    let setRandNumber = action(
        () => true,
        () => {
            setVariable("randNumber", getRandNumber(1, locations.length));
        },
        0
    );

    var BTlist: Tick[] = [];
    let id: number = 0;
    for (let i = 0; i < locations.length; i++) {
        //console.log(locations[i]);
        let actions: Tick = action(() => getVariable("randNumber") == i + 1, () => setVariable("destination", locations[i]), 0);
        BTlist.push(actions);
    }
    let atDestination: Precondition = () => getVariable("destination") == getAgentVariable(alien, "currentLocation");
    let setDestinationPrecond: Precondition = () => isVariableNotSet("destination") || atDestination();

// create behavior trees
    let setNextDestination = sequence([
        setRandNumber,
        selector(BTlist),
    ]);

    let gotoNextLocation = action(
        () => true,
        () => {
            setAgentVariable(alien, "currentLocation", getNextLocation(getAgentVariable(alien, "currentLocation"), getVariable("destination")));
            console.log("Alien is at: " + getAgentVariable(alien, "currentLocation"))
        },
        0
    );

    let eatPlayer = action(() => getAgentVariable(alien, "currentLocation") == getVariable(playerLocation),
        () => {
            setVariable("endGame", "lose");
            setVariable(playerLocation, "NA");
        }, 0
    );

    let search = sequence([
        selector([
            guard(setDestinationPrecond, setNextDestination),
            action(() => true, () => {
            }, 0)
        ]),
        gotoNextLocation,
    ]);

    let alienBT = selector([
        eatPlayer,
        sequence([
            search, eatPlayer
        ])
    ]);

//attach behaviour trees to agents
    attachTreeToAgent(alien, alienBT);
    // 3. Construct story
    // create user actions
    for (let key in locationGraph) {
        let seq: any[] = [];
        seq.push(displayDescriptionAction("You enter the " + key + "."));
        seq.push(addUserAction("Stay where you are.", () => {}));
        for (let adj of locationGraph[key]) {
            seq.push(addUserAction("Enter the " + adj + ".", () => setVariable(playerLocation, adj)));
        }
        var StateBT = guard(() => getVariable(playerLocation) == key,
            sequence(seq));
        addUserInteractionTree(StateBT);
    }


    var crewCard1BT = guard(() => getVariable(playerLocation) == getItemVariable(crewCard1, "currentLocation"),
        sequence([
                displayDescriptionAction("You notice a crew card lying around."),
                addUserActionTree("Pick up the crew card",
                    sequence([
                        action(() => true, () => {
                            displayActionEffectText("You pick up the crew card.");
                            setItemVariable(crewCard1, "currentLocation", "player");
                            setVariable(crewCardsCollected, getVariable(crewCardsCollected) + 1);
                        }, 0),
                        action(() => true, () => {
                            displayActionEffectText("Wow you know how to pick up things.")
                        }, 0)
                    ])
                )
            ]
        ));
    var crewCard2BT = guard(() => getVariable(playerLocation) == getItemVariable(crewCard2, "currentLocation"),
        sequence([
                displayDescriptionAction("You notice a crew card lying around."),
                addUserAction("Pick up the crew card", () => {
                    displayActionEffectText("You pick up the crew card.");
                    setItemVariable(crewCard2, "currentLocation", "player");
                    setVariable(crewCardsCollected, getVariable(crewCardsCollected) + 1);
                })
            ]
        ));
    var ExitBT = guard(() => getVariable(playerLocation) == "Exit",
        selector([
            guard(() => getVariable(crewCardsCollected) >= 2,
                sequence([
                    displayDescriptionAction("You can now activate the exit and flee!"),
                    addUserAction("Activate and get out!", () => {
                        setVariable("endGame", "win");
                        setVariable(playerLocation, "NA")
                    })
                ])),
            displayDescriptionAction("You need 2 crew cards to activate the exit elevator system.")
        ]));
    addUserInteractionTree(crewCard1BT);
    addUserInteractionTree(crewCard2BT);
    addUserInteractionTree(ExitBT);

    var alienNearby = guard(() => areAdjacent(getVariable(playerLocation), getAgentVariable(alien, "currentLocation")),
        displayDescriptionAction("You hear a thumping sound. The alien is nearby."));
    addUserInteractionTree(alienNearby);

    var gameOver = guard(() => getVariable(playerLocation) == "NA",
        selector([
                guard(() => getVariable("endGame") == "win",
                    displayDescriptionAction("You have managed to escape!")),
                guard(() => getVariable("endGame") == "lose",
                    displayDescriptionAction("The creature grabs you before you can react! You struggle for a bit before realising it's all over.."))
            ]
        ));
    addUserInteractionTree(gameOver);

//Initialize sigma

//for custom shapes
    sigma.canvas.nodes.border = function (node: any, context: any, settings: any) {
        var prefix = settings('prefix') || '';

        context.fillStyle = node.color || settings('defaultNodeColor');
        context.beginPath();
        context.arc(
            node[prefix + 'x'],
            node[prefix + 'y'],
            node[prefix + 'size'],
            0,
            Math.PI * 2,
            true
        );

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

    var edgeID: number = 0;

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
            })
        }
    }

    var dragListener = sigma.plugins.dragNodes(
        sigmaInstance, sigmaInstance.renderers[0]);

    dragListener.bind('startdrag', function (event: string) {
        console.log(event);
    });
    dragListener.bind('drag', function (event: string) {
        console.log(event);
    });
    dragListener.bind('drop', function (event: string) {
        console.log(event);
    });
    dragListener.bind('dragend', function (event: string) {
        console.log(event);
    });


//4. Run the world
    initialize();
    var userInteractionObject = getUserInteractionObject();

//RENDERING-----
//var displayPanel = {x: 500, y: 0};
    var textPanel = {x: 400, y: 350};
    var actionsPanel = {x: 420, y: 375};

    function render() {
        let alienLocation = getAgentVariable(alien, "currentLocation");
        let playerL = getVariable(playerLocation);
        for (var node of sigmaInstance.graph.nodes()) {
            node.color = '#000';
        }
        sigmaInstance.graph.nodes(alienLocation).color = '#0efa76';
        if (!isUndefined(sigmaInstance.graph.nodes(playerL))) {
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
        listener.bind('start stop interpolate', function (event: any) {
            console.log(event.type);
        });

//Start the algorithm:
        sigmaInstance.startNoverlap();
        //sigmaInstance.startForceAtlas2();

        displayTextAndActions();
    }

    var canvas = <HTMLCanvasElement> document.getElementById('display');
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
        console.log("Crew cards: " + getVariable(crewCardsCollected));
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
            if (!isUndefined(selectedAction)) {
                executeUserAction(selectedAction);
                worldTick();
                render();
            }
        }
    }

    function keyDown(e) {
        if (e.keyCode == 40) {//down
            if (userInteractionObject.userActionsText.length != 0) {
                currentSelection++;
                currentSelection = currentSelection % userInteractionObject.userActionsText.length;
                displayArrow();
            }
        } else if (e.keyCode == 38) {//up
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