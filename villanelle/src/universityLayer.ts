/* /// <reference path="scripting.ts"/> */
import {
    addAgent, setAgentVariable, addItem, addLocation, setVariable, getNextLocation, action,
    getRandNumber, getVariable, sequence, selector, execute, Precondition, getAgentVariable, neg_guard, guard,
    isVariableNotSet, displayDescriptionAction, addUserAction, addUserInteractionTree, initialize,
    getUserInteractionObject, executeUserAction, worldTick, attachTreeToAgent, setItemVariable, getItemVariable,
    displayActionEffectText, areAdjacent, addUserActionTree, locationGraph, Tick
} from "./scripting";
import {isUndefined} from "typescript-collections/dist/lib/util";

let sigma = require('linkurious');
(<any>window).sigma = sigma;
require('linkurious/plugins/sigma.plugins.dragNodes/sigma.plugins.dragNodes');
require('linkurious/plugins/sigma.plugins.animate/sigma.plugins.animate');
require('linkurious/plugins/sigma.layouts.noverlap/sigma.layouts.noverlap');
require('linkurious/plugins/sigma.renderers.linkurious/canvas/sigma.canvas.nodes.def');

type maps = { [key: string]: string[] };

var filePrefix = "../data/university/";
var fileSuffix = ".csv"
let files = ["cfgGramma", "Prefix"]

class cfgTrees {
    private val: string;
    private branches: cfgTrees[] | null;
    private idLabel: { [key: string]: string };


    constructor(name: string, rule: maps, prefix: string[], prevName: string) {
        var cleanName: string;
        this.branches = null;
        this.idLabel = {}
        if (name.startsWith('#')) {
            this.branches = [];
            if (name.endsWith('*')) {
                cleanName = name.substring(1, name.length - 1);
                this.val = cleanName;
                this.idLabel[this.val] = cleanName;
            } else if (name.endsWith('$')) {
                cleanName = name.substring(1, name.length - 1);
                this.val = prevName + " " + cleanName;
                this.idLabel[this.val] = cleanName;
            } else {
                cleanName = name.substring(1, name.length);
                this.val = retRand(prefix) + " " + cleanName;
                this.idLabel[this.val] = this.val
            }
            var children: string[] = rule[cleanName];
            for (let value of children) {
                var newBranch = new cfgTrees(value, rule, prefix, this.val);
                combine(this.idLabel, newBranch.idLabel);
                this.branches.push(newBranch);
            }
        } else if (name.endsWith('*')) {
            cleanName = name.substring(0, name.length - 1);
            this.val = cleanName;
            this.idLabel[this.val] = cleanName;
        } else if (name.endsWith('$')) {
            cleanName = name.substring(0, name.length - 1);
            this.val = prevName + " " + cleanName;
            this.idLabel[this.val] = cleanName;
        } else {
            cleanName = name;
            this.val = retRand(prefix) + " " + cleanName;
            this.idLabel[this.val] = this.val
        }
    }

    getValue(): string {
        return this.val;
    }

    getBranches(): cfgTrees[] | null {
        return this.branches;
    }

    isLeaf(): boolean {
        return (this.branches == null);
    }

    getIdLabelPair(): { [key: string]: string } {
        return this.idLabel;
    }

    getBranchValues(): string[] {
        let ret: string[] = [];
        if (this.branches != null) {
            for (let value of this.branches) {
                ret.push(value.val);
            }
        }
        return ret;
    }

    getExpandList(): maps {
        let expandList: maps = {};
        if (this.branches != null) {
            expandList[this.val] = this.getBranchValues();
            for (let tree of this.branches) {
                combine(expandList, tree.getExpandList());
            }
        }
        return expandList;
    }

    getPrevnameList(): { [key: string]: string } {
        let PrevnameList: { [key: string]: string } = {};
        for (var name of this.getBranchValues()) {
            PrevnameList[name] = this.val;
        }
        if (this.branches != null) {
            for (let tree of this.branches) {
                combine(PrevnameList, tree.getPrevnameList());
            }
        }
        return PrevnameList;
    }

    getExpandGraph(): { [key: string]: maps } {
        let expandList = this.getExpandList();
        let expandGraph: { [key: string]: maps } = {};
        for (var keys of Object.keys(expandList)) {
            expandGraph[keys] = connectNodes(expandList[keys]);
        }
        return expandGraph;
    }

    //This method ignores the first value of the tree
    getAllValues(): string[] {
        var ret: string[] = [];
        ret = ret.concat(this.getBranchValues());
        if (this.branches != null) {
            for (let tree of this.branches) {
                ret = ret.concat(tree.getBranchValues())
            }
        }
        return ret;
    }

    print(): void {
        if (this.branches != null) {
            console.log(this.branches);
            for (let value of this.branches) {
                value.print();
            }
        }
    }

}

function combine(dict1: { [key: string]: any }, dict2: { [key: string]: any }): { [key: string]: any } {
    for (var val of Object.keys(dict2)) {
        dict1[val] = dict2[val];
    }
    return dict1;
}

function retRand(list: any[]) {
    var index = getRandNumber(0, list.length - 1);
    var ret = list[index];
    list.splice(index, 1);
    return ret;
}

async function readFiles(): Promise<maps> {
    let data: maps = {};

    for (var file of files) {
        let value = await new Promise(function (resolve, reject) {
                var req = new XMLHttpRequest();
                req.onreadystatechange = function () {
                    if (this.readyState == 4) {
                        if (this.status == 200) {
                            var lines = this.responseText.split(/\n|\r\n/);
                            data[file] = lines;
                            resolve(lines);
                        } else {
                            reject(Error(req.statusText));
                        }
                    }
                }
                req.open("GET", filePrefix + file + fileSuffix, true);
                req.responseType = "text";
                req.send(null);
            }
        );
    }

    return Promise.resolve(data);
}

readFiles().then(function (value) {
    var tree: cfgTrees = processData(value);
    InitializeVilillane(tree);
})

function processData(data: maps): cfgTrees {
    let Prefix: string[] = data['Prefix'];
    let newRule: maps = {};
    let rawRule = data['cfgGramma'];
    for (let i = 0; i < rawRule.length; i++) {
        let rows = rawRule[i].split(',');
        var children = rows[1].split(';');
        var result: string[] = [];
        for (let j = 0; j < children.length; j++) {
            let elements = children[j].split('.');
            let num = getRandNumber(Number(elements[1]), Number(elements[2]));
            for (let k = 0; k < num; k++) {
                result.push(elements[0]);
            }
        }
        newRule[rows[0]] = result;
    }
    let newTree = new cfgTrees('#University', newRule, Prefix, '');
    return newTree;
}


function connectNodes(location: string[]): maps {
    let nodes: maps = {};
    let visited: { [key: string]: boolean } = {};
    for (let i = 0; i < location.length; i++) {
        visited[location[i]] = false;
    }
    let stack: string[] = [];
    let rest: string[] = [];

    //randomly generate a graph
    for (let i = 0; i < location.length; i++) {
        if (isUndefined(nodes[location[i]])) {
            nodes[location[i]] = []
        }
        for (let j = i + 1; j < location.length; j++) {
            if (isUndefined(nodes[location[j]])) {
                nodes[location[j]] = [];
            }
            if (Math.random() < (2 / location.length)) {
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


function InitializeVilillane(Tree: cfgTrees) {
    var expandGraph: { [key: string]: maps } = Tree.getExpandGraph();
    var expandList: maps = Tree.getExpandList();
    var idLabelPair: { [key: string]: string } = Tree.getIdLabelPair();
    var PrevnameList: { [key: string]: string } = Tree.getPrevnameList();
    var bool: { [keys: string]: boolean } = {};
    for (var val of Tree.getAllValues()) {
        bool[val] = false;
    }

    //Add locations to villanelle
    function addLocationGraph(graph: maps) {
        for (var key in graph) {
            if (key !== Tree.getValue()) {
                addLocation(key, graph[key]);
            }
        }
    }

    addLocationGraph(expandList);

    for (var key in expandGraph) {
        addLocationGraph(expandGraph[key]);
    }

    var locations = Object.keys(locationGraph);
// agents
    var alien = addAgent("Alien");

// items

    var crewCard1 = addItem("Crew card1");
    var crewCard2 = addItem("Crew card2");
    setItemVariable(crewCard1, "currentLocation", retRand(locations));
    setItemVariable(crewCard2, "currentLocation", retRand(locations));

// variables

//alien

    setAgentVariable(alien, "currentLocation", retRand(locations));

//player
    var playerLocation = setVariable("playerLocation", retRand(locations));
    var crewCardsCollected = setVariable("crewCardsCollected", 0);
    console.log(getVariable(playerLocation));

// 2. Define BTs
// create ground actions

    //Recover location array
    locations = Object.keys(locationGraph);
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
        seq.push(displayDescriptionAction("You enter the " + idLabelPair[key] + "."));
        seq.push(addUserAction("Stay where you are.", () => {
        }));
        if (Object.keys(locationGraph).includes(PrevnameList[key])) {
            seq.push(addUserAction("Go outside to " + idLabelPair[PrevnameList[key]] + ".", () => {
                setVariable(playerLocation, PrevnameList[key]);
            }));
        }
        if (Object.keys(expandList).includes(key)) {
            seq.push(addUserAction("Go inside " + idLabelPair[key] + " to enter " + idLabelPair[expandList[key][0]] + ".", () => setVariable(playerLocation, expandList[key][0])));
        }
        var graph = completeGraph(expandGraph[PrevnameList[key]])
        for (let adj of graph[key]) {
            seq.push(addUserAction("Enter the " + idLabelPair[adj] + ".", () => setVariable(playerLocation, adj)));
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

    var edgeID: number = 0;

    function clear() {
        var nodes = sigmaInstance.graph.nodes();
        for (var node of nodes) {
            sigmaInstance.graph.dropNode(node.id);
        }
    }

    function completeGraph(graph: maps) {
        var retGraph: maps = {};
        for (var key in graph) {
            if (isUndefined(retGraph[key])) {
                retGraph[key] = [];
            }
            retGraph[key] = retGraph[key].concat(graph[key]);
            for (var loc of graph[key]) {
                if (isUndefined(retGraph[loc])) {
                    retGraph[loc] = [];
                }
                retGraph[loc].push(key);
            }
        }
        return retGraph;
    }

    function showAround(input: string) {
        var graph = completeGraph(expandGraph[PrevnameList[input]]);
        var adjacent = graph[input];
        var numberLayer = adjacent.length;
        if (isUndefined(sigmaInstance.graph.nodes(input))) {
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
            if (isUndefined(sigmaInstance.graph.nodes(adjacent[i]))) {
                sigmaInstance.graph.addNode({
                    // Main attributes:
                    id: adjacent[i],
                    label: idLabelPair[adjacent[i]],
                    x: Math.cos(Math.PI * 2 * (i - 1 / 3) / numberLayer) * 40 + sigmaInstance.graph.nodes(input).x,
                    y: Math.sin(Math.PI * 2 * (i - 1 / 3) / numberLayer) * 40 + sigmaInstance.graph.nodes(input).y,
                    size: 15,
                    borderColor: '#fff'
                })
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

    function show(inputid: string) {
        var graph = completeGraph(expandGraph[PrevnameList[inputid]]);
        var adjacent = graph[inputid];
        var numberLayer = adjacent.length;
        showAround(inputid);
        if (Object.keys(graph).length < 10) {
            for (var layer1 of adjacent) {
                showAround(layer1);
                let newAdjacent = graph[layer1];
                for (var layer2 of newAdjacent) {
                    showAround((layer2))
                }
            }
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
        if (Object.keys(locationGraph).includes(playerL)) {
            clear();
            show(playerL);
        }
        for (var node of sigmaInstance.graph.nodes()) {
            if (node.id == alienLocation) {
                node.image = {url: '../images/xenomorph.png'};;
            }
            if (node.id == playerL) {
                node.image = {url: '../images/player2.png'}
            }
        }
        sigmaInstance.refresh();
        var config = {
            nodeMargin: 50,
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