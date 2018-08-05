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
const scripting_1 = require("./scripting");
const util_1 = require("typescript-collections/dist/lib/util");
let sigma = require('linkurious');
window.sigma = sigma;
require('linkurious/plugins/sigma.plugins.dragNodes/sigma.plugins.dragNodes');
require('linkurious/plugins/sigma.plugins.animate/sigma.plugins.animate');
require('linkurious/plugins/sigma.layouts.noverlap/sigma.layouts.noverlap');
require('linkurious/plugins/sigma.renderers.linkurious/canvas/sigma.canvas.nodes.def');
var filePrefix = "../data/university/";
let files = ["cfgGramma.csv", "Prefix.csv", "NPCconstraint.txt"];
class cfgTrees {
    constructor(name, rule, prefix, prevName) {
        var cleanName;
        var idpre = '';
        var labelpre = '';
        this.branches = null;
        this.idLabel = {};
        this.assortedDict = {};
        this.items = null;
        if (name.endsWith('*')) {
            cleanName = name.substring(0, name.length - 1);
        }
        else if (name.endsWith('$')) {
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
            if (name.startsWith('#!')) {
                this.items = [];
                cleanName = cleanName.substring(2, cleanName.length);
                var rawitems = processRand(rule[cleanName]);
                for (var item of rawitems) {
                    this.items.push(prevName + " " + item);
                    this.idLabel[prevName + " " + item] = item;
                }
            }
            else {
                cleanName = cleanName.substring(1, cleanName.length);
            }
            var children = processRand(rule[cleanName]);
            for (let value of children) {
                var newBranch = new cfgTrees(value, rule, prefix, idpre + cleanName);
                combine(this.idLabel, newBranch.idLabel);
                combine(this.assortedDict, newBranch.assortedDict);
                this.branches.push(newBranch);
            }
        }
        else if (name.startsWith('!')) {
            cleanName = cleanName.substring(1, cleanName.length);
            this.items = [];
            var rawitems = processRand(rule[cleanName]);
            for (var item of rawitems) {
                this.items.push(prevName + " " + item);
                this.idLabel[prevName + " " + item] = item;
            }
        }
        this.val = idpre + cleanName;
        this.idLabel[this.val] = labelpre + cleanName;
        if (util_1.isUndefined(this.assortedDict[cleanName.toLowerCase()])) {
            this.assortedDict[cleanName.toLowerCase()] = [];
        }
        this.assortedDict[cleanName.toLowerCase()].push(this.val);
    }
    getValue() {
        return this.val;
    }
    getBranches() {
        return this.branches;
    }
    isLeaf() {
        return (this.branches == null);
    }
    getIdLabelPair() {
        return this.idLabel;
    }
    getBranchValues() {
        let ret = [];
        if (this.branches != null) {
            for (let value of this.branches) {
                ret.push(value.val);
            }
        }
        return ret;
    }
    getExpandList() {
        let expandList = {};
        if (this.branches != null) {
            expandList[this.val] = this.getBranchValues();
            for (let tree of this.branches) {
                combine(expandList, tree.getExpandList());
            }
        }
        return expandList;
    }
    getPrevnameList() {
        let PrevnameList = {};
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
    //This method ignores the first value of the tree
    getAllValues() {
        var ret = [];
        ret = ret.concat(this.getBranchValues());
        if (this.branches != null) {
            for (let tree of this.branches) {
                ret = ret.concat(tree.getBranchValues());
            }
        }
        return ret;
    }
    getAssortedDict() {
        return this.assortedDict;
    }
    getItemsList() {
        var ret = {};
        if (this.items != null) {
            ret[this.val] = this.items;
        }
        if (this.branches != null) {
            for (let tree of this.branches) {
                combine(ret, tree.getItemsList());
            }
        }
        return ret;
    }
    getAlllocations() {
        let ret = [];
        ret.push(this.getValue());
        if (this.branches != null) {
            for (var child of this.branches) {
                ret = ret.concat(child.getAlllocations());
            }
        }
        return ret;
    }
    print() {
        if (this.branches != null) {
            console.log(this.branches);
            for (let value of this.branches) {
                value.print();
            }
        }
    }
}
class constrain {
    constructor(data) {
        this.item = [];
        this.location = [];
        this.agent = [];
        this.locationItem = {};
        var regExp = /\(([^)]+)\)/;
        for (let val of data) {
            var parentheses = val.match(regExp)[1];
            var input = parentheses.split(',');
            if (val.toLowerCase().startsWith('pickup')) {
                for (var i = 0; i < input.length; i++) {
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
                if (util_1.isUndefined(this.locationItem[input[2]])) {
                    this.locationItem[input[2]] = [];
                }
                this.locationItem[input[2]].push(input[1]);
            }
            else if (val.toLowerCase().startsWith('move')) {
                for (var i = 0; i < input.length; i++) {
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
function combine(dict1, dict2) {
    for (var val of Object.keys(dict2)) {
        if (util_1.isUndefined(dict1[val])) {
            dict1[val] = dict2[val];
        }
        else {
            dict1[val] = dict1[val].concat(dict2[val]);
        }
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
    return __awaiter(this, void 0, void 0, function* () {
        let data = {};
        for (var file of files) {
            let value = yield new Promise(function (resolve, reject) {
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
            });
        }
        return Promise.resolve(data);
    });
}
readFiles().then(function (value) {
    console.log(value);
    var tree = generateTree(value);
    var condition = processCondition(value);
    //var constrain:maps
    InitializeVilillane(tree, condition);
});
function generateTree(data) {
    let Prefix = data['Prefix.csv'];
    let newRule = {};
    let rawRule = data['cfgGramma.csv'];
    for (let i = 0; i < rawRule.length; i++) {
        let rows = rawRule[i].split(',');
        newRule[rows[0]] = rows[1];
    }
    let newTree = new cfgTrees('#University', newRule, Prefix, '');
    return newTree;
}
function processCondition(data) {
    var condition = new constrain(data["NPCconstraint.txt"]);
    return condition;
}
function processRand(data) {
    var children = data.split(';');
    var result = [];
    for (let j = 0; j < children.length; j++) {
        let elements = children[j].split('.');
        let num = scripting_1.getRandNumber(Number(elements[1]), Number(elements[2]));
        for (let k = 0; k < num; k++) {
            result.push(elements[0]);
        }
    }
    return result;
}
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
        if (util_1.isUndefined(nodes[location[i]])) {
            nodes[location[i]] = [];
        }
        for (let j = i + 1; j < location.length; j++) {
            if (util_1.isUndefined(nodes[location[j]])) {
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
    for (let i = 0; i < rest.length - 1; i++) {
        nodes[rest[i]].push(rest[i + 1]);
    }
    return nodes;
}
function InitializeVilillane(Tree, condition) {
    var assortDict = Tree.getAssortedDict();
    var itemsList = Tree.getItemsList();
    var expandList = Tree.getExpandList();
    var originlocations = Tree.getAlllocations();
    var idLabelPair = Tree.getIdLabelPair();
    var PrevnameList = Tree.getPrevnameList();
    // agents
    var alien = scripting_1.addAgent("Alien");
    // items
    var crewCard1 = scripting_1.addItem("Crew card1");
    var crewCard2 = scripting_1.addItem("Crew card2");
    // new constraint agents, locations and items
    var conditionAgent = condition.agent;
    var conditionlocation = condition.location;
    var conditionlocationItem = condition.locationItem;
    for (let agent of conditionAgent) {
        if (!scripting_1.agents.includes(agent)) {
            scripting_1.addAgent(agent);
        }
    }
    for (let loc of conditionlocation) {
        if (!Object.keys(assortDict).includes(loc.toLowerCase()) && !originlocations.includes(loc)) {
            expandList[Tree.getValue()].push(loc);
            idLabelPair[loc] = loc;
        }
    }
    for (let loc of Object.keys(conditionlocationItem)) {
        if (!Object.keys(assortDict).includes(loc.toLowerCase()) && !originlocations.includes(loc)) {
            itemsList[loc] = conditionlocationItem[loc];
        }
        else if (Object.keys(assortDict).includes(loc.toLowerCase())) {
            if (util_1.isUndefined(itemsList[assortDict[loc][0]])) {
                itemsList[assortDict[loc][0]] = [];
            }
            else {
                itemsList[assortDict[loc][0]] = itemsList[assortDict[loc][0]].concat(conditionlocationItem[loc]);
            }
        }
        else if (originlocations.includes(loc)) {
            if (util_1.isUndefined(itemsList[loc])) {
                itemsList[loc] = [];
            }
            else {
                itemsList[loc] = itemsList[loc].concat(conditionlocationItem[loc]);
            }
        }
    }
    for (var key of Object.keys(itemsList)) {
        for (var i = 0; i < itemsList[key].length; i++) {
            scripting_1.addItem(itemsList[key][i]);
            scripting_1.setItemVariable(itemsList[key][i], "currentLocation", key);
        }
    }
    scripting_1.setItemVariable(crewCard1, "currentLocation", retRand(locations));
    scripting_1.setItemVariable(crewCard2, "currentLocation", retRand(locations));
    var itemDisplay = scripting_1.setVariable("itemDisplay", false);
    let expandGraph = {};
    for (var keys of Object.keys(expandList)) {
        expandGraph[keys] = connectNodes(expandList[keys]);
    }
    //var itemindex:number = 0;
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
    // variables
    //alien
    scripting_1.setAgentVariable(alien, "currentLocation", retRand(locations));
    //player
    var playerLocation = scripting_1.setVariable("playerLocation", retRand(locations));
    var crewCardsCollected = scripting_1.setVariable("crewCardsCollected", 0);
    var inventory = scripting_1.setVariable("inventory", []);
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
    locations = Object.keys(scripting_1.locationGraph);
    let setRandNumber = scripting_1.action(() => true, () => {
        scripting_1.setVariable("randNumber", scripting_1.getRandNumber(1, locations.length));
    }, 0);
    var BTlist = [];
    let id = 0;
    for (let i = 0; i < locations.length; i++) {
        //console.log(locations[i]);
        let actions = scripting_1.action(() => scripting_1.getVariable("randNumber") == i + 1, () => scripting_1.setVariable("destination", locations[i]), 0);
        BTlist.push(actions);
    }
    let atDestination = () => scripting_1.getVariable("destination") == scripting_1.getAgentVariable(alien, "currentLocation");
    let setDestinationPrecond = () => scripting_1.isVariableNotSet("destination") || atDestination();
    // create behavior trees
    let setNextDestination = scripting_1.sequence([
        setRandNumber,
        scripting_1.selector(BTlist),
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
    for (let key in scripting_1.locationGraph) {
        let seq = [];
        seq.push(scripting_1.displayDescriptionAction("You enter the " + idLabelPair[key] + "."));
        seq.push(scripting_1.addUserAction("Stay where you are.", () => {
        }));
        if (Object.keys(scripting_1.locationGraph).includes(PrevnameList[key])) {
            seq.push(scripting_1.addUserAction("Go outside to " + idLabelPair[PrevnameList[key]] + ".", () => {
                scripting_1.setVariable(playerLocation, PrevnameList[key]);
            }));
        }
        if (Object.keys(expandList).includes(key)) {
            seq.push(scripting_1.addUserAction("Go inside " + idLabelPair[key] + " to enter " + idLabelPair[expandList[key][0]] + ".", () => scripting_1.setVariable(playerLocation, expandList[key][0])));
        }
        var graph = completeGraph(expandGraph[PrevnameList[key]]);
        for (let adj of graph[key]) {
            seq.push(scripting_1.addUserAction("Enter the " + idLabelPair[adj] + ".", () => scripting_1.setVariable(playerLocation, adj)));
        }
        var StateBT = scripting_1.guard(() => scripting_1.getVariable(playerLocation) == key && scripting_1.getVariable(itemDisplay) == false, scripting_1.sequence(seq));
        scripting_1.addUserInteractionTree(StateBT);
    }
    var itemBT = scripting_1.guard(() => !util_1.isUndefined(itemsList[scripting_1.getVariable(playerLocation)]) && itemsList[scripting_1.getVariable(playerLocation)].length != 0 && scripting_1.getVariable(itemDisplay) == false, scripting_1.sequence([
        scripting_1.displayDescriptionAction("You notice items lying around."),
        scripting_1.addUserAction("show all the items", () => scripting_1.setVariable(itemDisplay, true))
    ]));
    scripting_1.addUserInteractionTree(itemBT);
    for (let i = 0; i < scripting_1.items.length; i++) {
        var showitemBT = scripting_1.guard(() => scripting_1.getVariable(playerLocation) == scripting_1.getItemVariable(scripting_1.items[i], "currentLocation") && scripting_1.getVariable(itemDisplay) == true, scripting_1.sequence([
            scripting_1.addUserAction("Pick up the " + scripting_1.items[i] + ".", () => {
                scripting_1.setVariable(itemDisplay, false);
                var curInv = scripting_1.getVariable("inventory");
                curInv.push(scripting_1.items[i]);
                itemsList[scripting_1.getVariable(playerLocation)].splice(itemsList[scripting_1.getVariable(playerLocation)].indexOf(scripting_1.items[i]), 1);
                scripting_1.displayActionEffectText("You pick up the " + scripting_1.items[i] + ".");
                scripting_1.setItemVariable(scripting_1.items[i], "currentLocation", "player");
                scripting_1.setVariable("inventory", curInv);
            })
        ]));
        scripting_1.addUserInteractionTree(showitemBT);
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
    var ExitBT = scripting_1.guard(() => scripting_1.getVariable(playerLocation) == "Exit", scripting_1.selector([
        scripting_1.guard(() => scripting_1.getVariable(crewCardsCollected) >= 2, scripting_1.sequence([
            scripting_1.displayDescriptionAction("You can now activate the exit and flee!"),
            scripting_1.addUserAction("Activate and get out!", () => {
                scripting_1.setVariable("endGame", "win");
                scripting_1.setVariable(playerLocation, "NA");
            })
        ])),
        scripting_1.displayDescriptionAction("You need 2 crew cards to activate the exit elevator system.")
    ]));
    scripting_1.addUserInteractionTree(crewCard1BT);
    scripting_1.addUserInteractionTree(crewCard2BT);
    scripting_1.addUserInteractionTree(ExitBT);
    var alienNearby = scripting_1.guard(() => scripting_1.areAdjacent(scripting_1.getVariable(playerLocation), scripting_1.getAgentVariable(alien, "currentLocation")), scripting_1.displayDescriptionAction("You hear a thumping sound. The alien is nearby."));
    scripting_1.addUserInteractionTree(alienNearby);
    var gameOver = scripting_1.guard(() => scripting_1.getVariable(playerLocation) == "NA", scripting_1.selector([
        scripting_1.guard(() => scripting_1.getVariable("endGame") == "win", scripting_1.displayDescriptionAction("You have managed to escape!")),
        scripting_1.guard(() => scripting_1.getVariable("endGame") == "lose", scripting_1.displayDescriptionAction("The creature grabs you before you can react! You struggle for a bit before realising it's all over.."))
    ]));
    scripting_1.addUserInteractionTree(gameOver);
    //Initialize sigma
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
    var edgeID = 0;
    function clear(sigma) {
        var nodes = sigma.graph.nodes();
        for (var node of nodes) {
            sigma.graph.dropNode(node.id);
        }
    }
    function completeGraph(graph) {
        var retGraph = {};
        for (var key in graph) {
            if (util_1.isUndefined(retGraph[key])) {
                retGraph[key] = [];
            }
            retGraph[key] = retGraph[key].concat(graph[key]);
            for (var loc of graph[key]) {
                if (util_1.isUndefined(retGraph[loc])) {
                    retGraph[loc] = [];
                }
                retGraph[loc].push(key);
            }
        }
        return retGraph;
    }
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
                size: 15,
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
        if (Object.keys(graph).length < 10) {
            for (var layer1 of adjacent) {
                showAround(layer1, sigmaInstance);
                let newAdjacent = graph[layer1];
                for (var layer2 of newAdjacent) {
                    showAround(layer2, sigmaInstance);
                }
            }
        }
    }
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
    //var displayPanel = {x: 500, y: 0};
    var textPanel = { x: 450, y: 350 };
    var actionsPanel = { x: 470, y: 375 };
    function render() {
        let alienPrevs = [];
        let playerPrevs = [];
        let AlienPrevLocs;
        let PlayerPrevLocs;
        let alienLocation = scripting_1.getAgentVariable(alien, "currentLocation");
        let playerL = scripting_1.getVariable(playerLocation);
        AlienPrevLocs = PrevnameList[alienLocation];
        while (AlienPrevLocs != Tree.getValue()) {
            alienPrevs.push(AlienPrevLocs);
            AlienPrevLocs = PrevnameList[AlienPrevLocs];
        }
        if (Object.keys(scripting_1.locationGraph).includes(playerL)) {
            PlayerPrevLocs = PrevnameList[playerL];
            while (PlayerPrevLocs != Tree.getValue()) {
                playerPrevs.push(PlayerPrevLocs);
                PlayerPrevLocs = PrevnameList[PlayerPrevLocs];
            }
            clear(sigmaPlayer);
            show(playerL, sigmaPlayer);
            clear(sigmaAlien);
            show(alienLocation, sigmaAlien);
        }
        else {
            clear(sigmaAlien);
            clear(sigmaPlayer);
            sigmaPlayer.refresh();
            sigmaAlien.refresh();
            //show(alienLocation, sigmaAlien);
        }
        for (var node of sigmaPlayer.graph.nodes()) {
            if (node.id == alienLocation) {
                node.image = { url: '../images/xenomorph.png' };
            }
            if (node.id == playerL) {
                node.image = { url: '../images/player2.png' };
            }
            if (alienPrevs.includes(node.id)) {
                node.border_color = '#ff0000';
            }
            if (!util_1.isUndefined(itemsList[node.id]) && itemsList[node.id].length != 0) {
                node.border_color = '#0000FF';
            }
        }
        for (var node of sigmaAlien.graph.nodes()) {
            if (node.id == alienLocation) {
                node.image = { url: '../images/xenomorph.png' };
            }
            if (node.id == playerL) {
                node.image = { url: '../images/player2.png' };
            }
            if (playerPrevs.includes(node.id)) {
                node.border_color = '#ADFF2F';
            }
        }
        sigmaPlayer.refresh();
        sigmaAlien.refresh();
        var config = {
            nodeMargin: 50,
            gridSize: 5,
        };
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
        console.log("Crew cards: " + scripting_1.getVariable(crewCardsCollected));
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
//# sourceMappingURL=universityLayer.js.map