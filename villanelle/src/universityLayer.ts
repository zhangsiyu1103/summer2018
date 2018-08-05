import {
    addAgent, setAgentVariable, addItem, addLocation, setVariable, getNextLocation, action,
    getRandNumber, getVariable, sequence, selector, execute, Precondition, getAgentVariable, neg_guard, guard,
    isVariableNotSet, displayDescriptionAction, addUserAction, addUserInteractionTree, initialize,
    getUserInteractionObject, executeUserAction, worldTick, attachTreeToAgent, setItemVariable, getItemVariable,
    displayActionEffectText, areAdjacent, addUserActionTree, locationGraph, agents, items, Tick
} from "./scripting";
import {isUndefined} from "typescript-collections/dist/lib/util";
//require all the library needed
let sigma = require('linkurious');
(<any>window).sigma = sigma;
require('linkurious/plugins/sigma.plugins.dragNodes/sigma.plugins.dragNodes');
require('linkurious/plugins/sigma.plugins.animate/sigma.plugins.animate');
require('linkurious/plugins/sigma.layouts.noverlap/sigma.layouts.noverlap');
require('linkurious/plugins/sigma.renderers.linkurious/canvas/sigma.canvas.nodes.def');
require('linkurious/plugins/sigma.plugins.tooltips/sigma.plugins.tooltips');
require('linkurious/plugins/sigma.plugins.design/sigma.plugins.design');


//A commonly used type
type maps = { [key: string]: string[] };
//File names
let filePrefix = "../data/university/";
let files = ["cfgGramma.csv", "Prefix.csv", "NPCconstraint.txt"];

//A structure for hierarchical generation
class cfgTrees {
    //the current location
    private val: string;
    //The children of the current location
    private branches: cfgTrees[] | null;
    //A pair for unique id
    private idLabel: { [key: string]: string };
    //A dict for different types of buildings
    private assortedDict: maps;
    //The items on current location
    private items: string[] | null;


    constructor(name: string, rule: { [key: string]: string }, prefix: string[], prevName: String) {
        let cleanName: string;
        let idpre: string = '';
        let labelpre: string = '';
        this.branches = null;
        this.idLabel = {};
        this.assortedDict = {};
        this.items = null;
        //* means the names remain unchanged
        //$ means the names has a prefix as previous name
        //# means the location is expandable
        if (name.endsWith('*')) {
            cleanName = name.substring(0, name.length - 1);
        } else if (name.endsWith('$')) {
            cleanName = name.substring(0, name.length - 1);
            idpre = prevName + " ";
        } else {
            cleanName = name;
            idpre = retRand(prefix) + ' ';
            labelpre = idpre;
        }

        if (name.startsWith('#')) {
            this.branches = [];
            if (name.startsWith('#!')) {
                this.items = [];
                cleanName = cleanName.substring(2, cleanName.length);
                let rawitems = processRand(rule[cleanName]);
                for (let item of rawitems) {
                    this.items.push(prevName + " " + item);
                    this.idLabel[prevName + " " + item] = item;
                }
            } else {
                cleanName = cleanName.substring(1, cleanName.length);
            }
            let children: string[] = processRand(rule[cleanName]);
            for (let value of children) {
                let newBranch = new cfgTrees(value, rule, prefix, idpre + cleanName);
                combine(this.idLabel, newBranch.idLabel);
                combine(this.assortedDict, newBranch.assortedDict);
                this.branches.push(newBranch);
            }
        } else if (name.startsWith('!')) {
            cleanName = cleanName.substring(1, cleanName.length);
            this.items = [];
            let rawitems = processRand(rule[cleanName]);
            for (let item of rawitems) {
                this.items.push(prevName + " " + item);
                this.idLabel[prevName + " " + item] = item;
            }
        }
        this.val = idpre + cleanName;
        this.idLabel[this.val] = labelpre + cleanName;
        if (isUndefined(this.assortedDict[cleanName.toLowerCase()])) {
            this.assortedDict[cleanName.toLowerCase()] = [];
        }
        this.assortedDict[cleanName.toLowerCase()].push(this.val);
    }

    getValue(): string {
        return this.val;
    }

    getBranches(): cfgTrees[] | null {
        return this.branches;
    }

    getIdLabelPair(): { [key: string]: string } {
        return this.idLabel;
    }

    // return the children's location names
    getBranchValues(): string[] {
        let ret: string[] = [];
        if (this.branches != null) {
            for (let value of this.branches) {
                ret.push(value.val);
            }
        }
        return ret;
    }

    //return a dict for expandable locations and their children
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

    //return a pair of each location and their parents' location
    getPrevnameList(): { [key: string]: string } {
        let PrevnameList: { [key: string]: string } = {};
        for (let name of this.getBranchValues()) {
            PrevnameList[name] = this.val;
        }
        if (this.branches != null) {
            for (let tree of this.branches) {
                combine(PrevnameList, tree.getPrevnameList());
            }
        }
        return PrevnameList;
    }

    //return a dict for assorted types
    getAssortedDict(): maps {
        return this.assortedDict;
    }

    //return a dict for the location and items corresponding to each location.
    getItemsList(): maps {
        let ret: maps = {};
        if (this.items != null) {
            ret[this.val] = this.items
        }
        if (this.branches != null) {
            for (let tree of this.branches) {
                combine(ret, tree.getItemsList());
            }
        }
        return ret;
    }

    //return a list of all locations in the map
    getAlllocations(): string[] {
        let ret: string[] = [];
        ret.push(this.getValue());
        if (this.branches != null) {
            for (let child of this.branches) {
                ret = ret.concat(child.getAlllocations());
            }
        }
        return ret;
    }

}

//A structure for NPC constraint
class constrain {
    //additional requirements for items, locations, agents and location-item relationship.
    item: string[];
    location: string[];
    agent: string[];
    locationItem: maps;

    constructor(data: string[]) {
        this.item = [];
        this.location = [];
        this.agent = [];
        this.locationItem = {};
        //read the value inside of a parenthesis.
        let regExp = /\(([^)]+)\)/;
        for (let val of data) {
            let parentheses = val.match(regExp)[1];
            let input = parentheses.split(',');
            //identify the motions of each goals.
            if (val.toLowerCase().startsWith('pickup')) {
                for (let i = 0; i < input.length; i++) {
                    while (input[i].startsWith(' ')) {
                        input[i] = input[i].substring(1);
                    }
                    while (input[i].endsWith(' ')) {
                        input[i] = input[i].substring(0, input[i].length - 1);
                    }
                }
                this.agent.push(input[0]);
                this.item.push(input[1]);
                this.location.push(input[2]);
                if (isUndefined(this.locationItem[input[2]])) {
                    this.locationItem[input[2]] = [];
                }
                this.locationItem[input[2]].push(input[1]);
            } else if (val.toLowerCase().startsWith('move')) {
                for (let i = 0; i < input.length; i++) {
                    while (input[i].startsWith(' ')) {
                        input[i] = input[i].substring(1);
                    }
                    while (input[i].endsWith(' ')) {
                        input[i] = input[i].substring(0, input[i].length - 1);
                    }

                }
                this.agent.push(input[0]);
                this.location.push(input[1]);
            }
        }
    }
}

//A function for combining to dictionary
function combine(dict1: { [key: string]: any }, dict2: { [key: string]: any }): { [key: string]: any } {
    for (let val of Object.keys(dict2)) {
        if (isUndefined(dict1[val])) {
            dict1[val] = dict2[val];
        } else {
            dict1[val] = dict1[val].concat(dict2[val]);
        }
    }
    return dict1;
}

//A function for return and delete a random number from a list
function retRand(list: any[]) {
    let index = getRandNumber(0, list.length - 1);
    let ret = list[index];
    list.splice(index, 1);
    return ret;
}

//Reading the files
async function readFiles(): Promise<maps> {
    let data: maps = {};

    for (let file of files) {
        let value = await new Promise(function (resolve, reject) {
                let req = new XMLHttpRequest();
                req.onreadystatechange = function () {
                    if (this.readyState == 4) {
                        if (this.status == 200) {
                            let lines = this.responseText.split(/\n|\r\n/);
                            data[file] = lines;
                            resolve(lines);
                        } else {
                            reject(Error(req.statusText));
                        }
                    }
                };
                req.open("GET", filePrefix + file, true);
                req.responseType = "text";
                req.send(null);
            }
        );
    }

    return Promise.resolve(data);
}

//call all the functions needed
readFiles().then(function (value) {
    let tree: cfgTrees = generateTree(value);
    let condition: constrain = processCondition(value);
    InitializeVilillane(tree, condition);
});

//From the raw data to generate the context-free grammar trees for the map
function generateTree(data: maps): cfgTrees {
    let Prefix: string[] = data['Prefix.csv'];
    let newRule: { [key: string]: string } = {};
    let rawRule = data['cfgGramma.csv'];
    for (let i = 0; i < rawRule.length; i++) {
        let rows = rawRule[i].split(',');
        newRule[rows[0]] = rows[1];
    }
    return new cfgTrees('#University', newRule, Prefix, '');
}

//From the raw data to generate the constraints
function processCondition(data: maps): constrain {
    return new constrain(data["NPCconstraint.txt"]);
}

//For each elements of context free grammar, generate a random number of certain type
// of buildings according to the minimum and maximum
function processRand(data: string): string[] {
    let children = data.split(';');
    let result: string[] = [];
    for (let j = 0; j < children.length; j++) {
        let elements = children[j].split('.');
        let num = getRandNumber(Number(elements[1]), Number(elements[2]));
        for (let k = 0; k < num; k++) {
            result.push(elements[0]);
        }
    }
    return result;
}


//Randomly generate a connected graphs from a list of nodes
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
                let cur = stack.pop();
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


function InitializeVilillane(Tree: cfgTrees, condition: constrain) {
    //get assortDict for NPC constraint
    let assortDict = Tree.getAssortedDict();
    //get itemList for display items
    let itemsList: maps = Tree.getItemsList();
    //get expandList to generate a expand graph
    let expandList: maps = Tree.getExpandList();
    //get all initialized locations
    let originlocations: string[] = Tree.getAlllocations();
    //get the initialized id pair
    let idLabelPair: { [key: string]: string } = Tree.getIdLabelPair();
    //get the initialized prevname pairs
    let PrevnameList: { [key: string]: string } = Tree.getPrevnameList();
    // agents
    let alien = addAgent("Alien");
    // items
    let crewCard1 = addItem("Crew card1");
    let crewCard2 = addItem("Crew card2");
    // new constraint agents, locations and items
    let conditionAgent = condition.agent;
    let conditionlocation = condition.location;
    let conditionlocationItem = condition.locationItem;

    //Apply the constraint to change the initialized data.
    for (let agent of conditionAgent) {
        if (!agents.includes(agent)) {
            addAgent(agent);
        }
    }
    for (let loc of conditionlocation) {
        if (!Object.keys(assortDict).includes(loc.toLowerCase()) && !originlocations.includes(loc)) {
            expandList[Tree.getValue()].push(loc);
            PrevnameList[loc] = Tree.getValue();
            idLabelPair[loc] = loc;
        }
    }
    for (let loc of Object.keys(conditionlocationItem)) {
        if (!Object.keys(assortDict).includes(loc.toLowerCase()) && !originlocations.includes(loc)) {
            itemsList[loc] = conditionlocationItem[loc];
        } else if (Object.keys(assortDict).includes(loc.toLowerCase())) {
            if (isUndefined(itemsList[assortDict[loc][0]])) {
                itemsList[assortDict[loc][0]] = []
            }
            itemsList[assortDict[loc][0]] = itemsList[assortDict[loc][0]].concat(conditionlocationItem[loc]);

        } else if (originlocations.includes(loc)) {
            if (isUndefined(itemsList[loc])) {
                itemsList[loc] = []
            } else {
                itemsList[loc] = itemsList[loc].concat(conditionlocationItem[loc]);
            }
        }
    }

    for (let key of Object.keys(itemsList)) {
        for (let i = 0; i < itemsList[key].length; i++) {
            addItem(itemsList[key][i]);
            setItemVariable(itemsList[key][i], "currentLocation", key);
        }
    }

    //Generate the expandGraph from the modified expandList
    //For each expandable location, the dictionary contains a randomly connected graph for all its children
    let expandGraph: { [key: string]: maps } = {};
    for (let keys of Object.keys(expandList)) {
        expandGraph[keys] = connectNodes(expandList[keys]);
    }
    console.log(itemsList);


    //Add locations to villanelle
    function addLocationGraph(graph: maps) {
        for (let key in graph) {
            if (key !== Tree.getValue()) {
                addLocation(key, graph[key]);
            }
        }
    }

    addLocationGraph(expandList);

    for (let key in expandGraph) {
        addLocationGraph(expandGraph[key]);
    }

    let locations = Object.keys(locationGraph);

    //items variable
    setItemVariable(crewCard1, "currentLocation", retRand(locations));
    setItemVariable(crewCard2, "currentLocation", retRand(locations));
    let itemDisplay = setVariable("itemDisplay", false);
// variables

//alien

    setAgentVariable(alien, "currentLocation", retRand(locations));

//player
    let playerLocation = setVariable("playerLocation", retRand(locations));
    let crewCardsCollected = setVariable("crewCardsCollected", 0);
    let inventory = setVariable("inventory", []);

// 2. Define BTs
// create ground actions
//     itemsList[getVariable(playerLocation)] = [];
//
//     allItems.push("card");
//     addItem("card");
//     setItemVariable("card", "currentLocation", getVariable(playerLocation));
//     itemsList[getVariable(playerLocation)].push("card");
//     allItems.push("book");
//     addItem("book");
//     setItemVariable("book", "currentLocation", getVariable(playerLocation));
//     itemsList[getVariable(playerLocation)].push("book");
//     allItems.push("key");
//     addItem("key");
//     setItemVariable("key", "currentLocation", getVariable(playerLocation));
//     itemsList[getVariable(playerLocation)].push("key");

    //Recover location array
    locations = Object.keys(locationGraph);
    let setRandNumber = action(
        () => true,
        () => {
            setVariable("randNumber", getRandNumber(1, locations.length));
        },
        0
    );
    //Initialize behavior tree for aliens
    let BTlist: Tick[] = [];
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
    // create user actions from the graphs
    for (let key in locationGraph) {
        let seq: any[] = [];
        seq.push(displayDescriptionAction("You enter the " + idLabelPair[key] + "."));
        seq.push(addUserAction("Stay where you are.", () => {
        }));
        //Check whether it's in a lower layer
        if (Object.keys(locationGraph).includes(PrevnameList[key])) {
            seq.push(addUserAction("Go outside to " + idLabelPair[PrevnameList[key]] + ".", () => {
                setVariable(playerLocation, PrevnameList[key]);
            }));
        }
        //Check whether it's has a children
        if (Object.keys(expandList).includes(key)) {
            seq.push(addUserAction("Go inside " + idLabelPair[key] + " to enter " + idLabelPair[expandList[key][0]] + ".", () => setVariable(playerLocation, expandList[key][0])));
        }

        let graph = completeGraph(expandGraph[PrevnameList[key]]);
        for (let adj of graph[key]) {
            seq.push(addUserAction("Enter the " + idLabelPair[adj] + ".", () => setVariable(playerLocation, adj)));
        }

        let StateBT = guard(() => getVariable(playerLocation) == key && getVariable(itemDisplay) == false,
            sequence(seq));
        addUserInteractionTree(StateBT);
    }
    //Behavior tree for items
    let itemBT = guard(() => !isUndefined(itemsList[getVariable(playerLocation)]) && itemsList[getVariable(playerLocation)].length != 0 && getVariable(itemDisplay) == false,
        sequence([
                displayDescriptionAction("You notice items lying around."),
                addUserAction("show all the items", () => setVariable(itemDisplay, true))
            ]
        ));
    //attach the bt to thr tree
    addUserInteractionTree(itemBT);

    //Create behavior trees for every items
    for (let i = 0; i < items.length; i++) {
        let showitemBT = guard(() => getVariable(playerLocation) == getItemVariable(items[i], "currentLocation") && getVariable(itemDisplay) == true,
            sequence([
                addUserAction("Pick up the " + items[i] + ".", () => {
                    setVariable(itemDisplay, false);
                    let curInv = getVariable("inventory");
                    curInv.push(items[i]);
                    itemsList[getVariable(playerLocation)].splice(itemsList[getVariable(playerLocation)].indexOf(items[i]), 1);
                    displayActionEffectText("You pick up the " + items[i] + ".");
                    setItemVariable(items[i], "currentLocation", "player");
                    setVariable("inventory", curInv)
                })]
            ));
        addUserInteractionTree(showitemBT);
    }

    //crewcard BT
    let crewCard1BT = guard(() => getVariable(playerLocation) == getItemVariable(crewCard1, "currentLocation"),
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

    let crewCard2BT = guard(() => getVariable(playerLocation) == getItemVariable(crewCard2, "currentLocation"),
        sequence([
                displayDescriptionAction("You notice a crew card lying around."),
                addUserAction("Pick up the crew card", () => {
                    displayActionEffectText("You pick up the crew card.");
                    setItemVariable(crewCard2, "currentLocation", "player");
                    setVariable(crewCardsCollected, getVariable(crewCardsCollected) + 1);
                })
            ]
        ));

    //A BT for the exit
    let ExitBT = guard(() => getVariable(playerLocation) == "Exit",
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

    let alienNearby = guard(() => areAdjacent(getVariable(playerLocation), getAgentVariable(alien, "currentLocation")),
        displayDescriptionAction("You hear a thumping sound. The alien is nearby."));
    addUserInteractionTree(alienNearby);

    let gameOver = guard(() => getVariable(playerLocation) == "NA",
        selector([
                guard(() => getVariable("endGame") == "win",
                    displayDescriptionAction("You have managed to escape!")),
                guard(() => getVariable("endGame") == "lose",
                    displayDescriptionAction("The creature grabs you before you can react! You struggle for a bit before realising it's all over.."))
            ]
        ));
    addUserInteractionTree(gameOver);

//Initialize sigma for player and alien
    let sigmaPlayer = new sigma({
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
    // var tooltipPlayer = sigma.plugins.tooltips(
    //     sigmaPlayer,
    //     sigmaPlayer.renderers[0],
    //     {
    //         node: [{
    //             show: 'clickNode',
    //             template: 'Hello node!'
    //         }]
    //     }
    // );
    let sigmaAlien = new sigma({
        graph: {
            nodes: [],
            edges: []
        },
        renderer: {
            type: 'canvas',
            container: 'alien-container'
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
    // var tooltipAlien = sigma.plugins.tooltips(
    //     sigmaAlien,
    //     sigmaAlien.renderers[0],
    //     {
    //         node: [{
    //             show: 'clickNode',
    //             template: 'Hello node!'
    //         }]
    //     }
    // );
    //A unique ID for each edge.
    let edgeID: number = 0;

    //Clear the graph.
    function clear(sigma: any) {
        let nodes = sigma.graph.nodes();
        for (let node of nodes) {
            sigma.graph.dropNode(node.id);
        }
    }

    //The graph generate by connect-node is one direction
    //This function make it two-direction
    function completeGraph(graph: maps) {
        let retGraph: maps = {};
        for (let key in graph) {
            if (isUndefined(retGraph[key])) {
                retGraph[key] = [];
            }
            retGraph[key] = retGraph[key].concat(graph[key]);
            for (let loc of graph[key]) {
                if (isUndefined(retGraph[loc])) {
                    retGraph[loc] = [];
                }
                retGraph[loc].push(key);
            }
        }
        return retGraph;
    }

    //Show the adjacent node of the input node
    function showAround(input: string, sigmaInstance: any) {
        let graph = completeGraph(expandGraph[PrevnameList[input]]);
        let adjacent = graph[input];
        let numberLayer = adjacent.length;
        if (isUndefined(sigmaInstance.graph.nodes(input))) {
            sigmaInstance.graph.addNode({
                // Main attributes:
                id: input,
                label: idLabelPair[input],
                x: 0,
                y: 0,
                size: 15,
            });
        }
        for (let i = 0; i < numberLayer; i++) {
            if (isUndefined(sigmaInstance.graph.nodes(adjacent[i]))) {
                sigmaInstance.graph.addNode({
                    // Main attributes:
                    id: adjacent[i],
                    label: idLabelPair[adjacent[i]],
                    x: Math.cos(Math.PI * 2 * (i - 1 / 3) / numberLayer) * 40 + sigmaInstance.graph.nodes(input).x,
                    y: Math.sin(Math.PI * 2 * (i - 1 / 3) / numberLayer) * 40 + sigmaInstance.graph.nodes(input).y,
                    size: 15,
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

    function show(inputid: string, sigmaInstance: any) {
        let graph = completeGraph(expandGraph[PrevnameList[inputid]]);
        let adjacent = graph[inputid];
        let numberLayer = adjacent.length;
        showAround(inputid, sigmaInstance)
        //Show additional nodes if all the node in this layer is small enough
        if (Object.keys(graph).length < 10) {
            for (let layer1 of adjacent) {
                showAround(layer1, sigmaInstance);
                let newAdjacent = graph[layer1];
                for (let layer2 of newAdjacent) {
                    showAround(layer2, sigmaInstance);
                }
            }
        }
    }

    //for dragging the nodes.
    let dragListener1 = sigma.plugins.dragNodes(
        sigmaPlayer, sigmaPlayer.renderers[0]);

    dragListener1.bind('startdrag', function (event: string) {
        console.log(event);
    });
    dragListener1.bind('drag', function (event: string) {
        console.log(event);
    });
    dragListener1.bind('drop', function (event: string) {
        console.log(event);
    });
    dragListener1.bind('dragend', function (event: string) {
        console.log(event);
    });

    let dragListener2 = sigma.plugins.dragNodes(
        sigmaAlien, sigmaAlien.renderers[0]);

    dragListener2.bind('startdrag', function (event: string) {
        console.log(event);
    });
    dragListener2.bind('drag', function (event: string) {
        console.log(event);
    });
    dragListener2.bind('drop', function (event: string) {
        console.log(event);
    });
    dragListener2.bind('dragend', function (event: string) {
        console.log(event);
    });


//4. Run the world
    initialize();
    let userInteractionObject = getUserInteractionObject();

//RENDERING-----
//let displayPanel = {x: 500, y: 0};
    let textPanel = {x: 450, y: 350};
    let actionsPanel = {x: 470, y: 375};

    function render() {
        //for all the parents locations of the agents
        let alienPrevs: string[] = [];
        let playerPrevs: string[] = [];
        let AlienPrevLocs: string;
        let PlayerPrevLocs: string;
        //get agents' current location
        let alienLocation = getAgentVariable(alien, "currentLocation");
        let playerL = getVariable(playerLocation);
        //generate all the parents locations of the alien
        AlienPrevLocs = PrevnameList[alienLocation];
        while (AlienPrevLocs != Tree.getValue()) {
            alienPrevs.push(AlienPrevLocs);
            AlienPrevLocs = PrevnameList[AlienPrevLocs];
        }
        //make sure the game is not ended.
        if (Object.keys(locationGraph).includes(playerL)) {
            //generate all the parents locations of the player
            PlayerPrevLocs = PrevnameList[playerL];
            while (PlayerPrevLocs != Tree.getValue()) {
                playerPrevs.push(PlayerPrevLocs);
                PlayerPrevLocs = PrevnameList[PlayerPrevLocs];
            }
            clear(sigmaPlayer);
            clear(sigmaAlien);
            show(playerL, sigmaPlayer);
            show(alienLocation, sigmaAlien);
            var playerText = document.getElementsByClassName("lefttext");
            playerText[0].innerHTML = "level: " + playerPrevs.length.toString() + ", currently inside "+PrevnameList[playerL];
            var AgentText = document.getElementsByClassName("righttext");
            AgentText[0].innerHTML = "level: " + alienPrevs.length.toString() +  ", currently inside "+PrevnameList[alienLocation];
        } else {
            clear(sigmaAlien);
            clear(sigmaPlayer);
            sigmaPlayer.refresh();
            sigmaAlien.refresh();
            //show(alienLocation, sigmaAlien);
        }
        //show the locations of player and agents on the graph
        for (let node of sigmaPlayer.graph.nodes()) {
            if (node.id == alienLocation) {
                node.image = {url: '../images/xenomorph.png'};
            }
            if (node.id == playerL) {
                node.image = {url: '../images/player2.png'};
            }
            if (alienPrevs.includes(node.id)) {
                node.border_color = '#ff0000';
            }
            if (!isUndefined(itemsList[node.id]) && itemsList[node.id].length != 0) {
                node.border_color = '#0000FF';
            }
        }
        for (let node of sigmaAlien.graph.nodes()) {
            if (node.id == alienLocation) {
                node.image = {url: '../images/xenomorph.png'};
            }
            if (node.id == playerL) {
                node.image = {url: '../images/player2.png'};
            }
            if (playerPrevs.includes(node.id)) {
                node.border_color = '#ADFF2F';
            }
        }
        sigmaPlayer.refresh();
        sigmaAlien.refresh();
        let config = {
            nodeMargin: 50,
            gridSize: 5,
        };

        //algorithm for no lapping layout.
        //Configure the algorithm
        let listener1 = sigmaPlayer.configNoverlap(config);
        let listener2 = sigmaAlien.configNoverlap(config);


        //Bind all events:
        listener1.bind('start stop interpolate', function (event: any) {
            console.log(event.type);
        });
        listener2.bind('start stop interpolate', function (event: any) {
            console.log(event.type);
        });

        //Start the algorithm:
        sigmaPlayer.startNoverlap();
        sigmaAlien.startNoverlap();

        displayTextAndActions();
    }

    let canvas = <HTMLCanvasElement> document.getElementById('display');
    let context = canvas.getContext('2d');

    let currentSelection;
    let yOffset = actionsPanel.y + 25;
    let yOffsetIncrement = 30;

    function displayTextAndActions() {
        context.clearRect(textPanel.x, textPanel.y, 1000, 1000);
        yOffset = actionsPanel.y + 25;

        context.font = "15pt Calibri";
        context.fillStyle = 'white';
        console.log("Actions effect text: " + userInteractionObject.actionEffectsText);
        let textToDisplay = userInteractionObject.actionEffectsText.length != 0 ? userInteractionObject.actionEffectsText : userInteractionObject.text;
        context.fillText(textToDisplay, textPanel.x, textPanel.y + 20);

        context.font = "15pt Calibri";
        context.fillStyle = 'white';
        for (let i = 0; i < userInteractionObject.userActionsText.length; i++) {
            let userActionText = userInteractionObject.userActionsText[i];
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
            context.fillText("> ", 470, actionsPanel.y + 25 + (currentSelection * yOffsetIncrement));
        }
    }

//User input
    function keyPress(e) {
        if (e.keyCode == 13) {
            let selectedAction = userInteractionObject.userActionsText[currentSelection];
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