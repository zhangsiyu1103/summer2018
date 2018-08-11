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
let filePrefix = "../data/";
let files = ["cfgGramma.csv", "Prefix.csv", "NPCconstraint.txt"];

//A structure for hierarchical generation
class cfgTrees {
    //the current location
    val: string;
    //The children of the current location
    branches: cfgTrees[] | null;
    //A pair for unique id
    idLabel: { [key: string]: string };
    //A dict for different types of buildings
    assortedDict: maps;
    //The items on current location
    items: string[] | null;
    //The name of upper layer location
    prevName: string


    constructor(name: string, rule: { [key: string]: string }, prefix: string[], prevName: String) {
        let cleanName: string;
        let idpre: string = '';
        let labelpre: string = '';
        this.branches = null;
        this.idLabel = {};
        this.assortedDict = {};
        this.items = null;
        this.prevName = prevName;
        //$ means the names has a prefix as previous name
        //# means the location is expandable
        //! means the names are items
        if (name.startsWith('!')) {
            let itemname = name.substring(1);
            this.items = [];
            this.items.push(prevName + " " + itemname);
            this.idLabel[prevName + " " + itemname] = itemname;
            this.val = 'item';
        } else {
            if (name.endsWith('$')) {
                cleanName = name.substring(0, name.length - 1);
                idpre = prevName + " ";
            } else {
                cleanName = name;
                idpre = retRand(prefix) + ' ';
                labelpre = idpre;
            }
            if (name.startsWith('#')) {
                this.branches = [];
                cleanName = cleanName.substring(1);
                let children: string[] = processRand(rule[cleanName]);
                for (let value of children) {
                    let newBranch = new cfgTrees(value, rule, prefix, idpre + cleanName);
                    combine(this.idLabel, newBranch.idLabel);
                    combine(this.assortedDict, newBranch.assortedDict);
                    this.branches.push(newBranch);
                }
            }
            this.val = idpre + cleanName;
            this.idLabel[this.val] = labelpre + cleanName;
            if (isUndefined(this.assortedDict[cleanName.toLowerCase()])) {
                this.assortedDict[cleanName.toLowerCase()] = [];
            }
            this.assortedDict[cleanName.toLowerCase()].push(this.val);
        }
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
                if (value.val != 'item') {
                    ret.push(value.val);
                }
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
            ret[this.prevName] = this.items
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

    print(): void {
        console.log(this.getValue());
        if (this.branches != null) {
            for (let value of this.branches) {
                value.print();
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
        await new Promise(function (resolve, reject) {
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
    //tree.print();
    // let condition: constrain = processCondition(value);
    InitializeVilillane(tree);
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
    return new cfgTrees('#University Map$', newRule, Prefix, '');
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
//The connected graph is one-direction for the addLocation function of villanelle
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
    //Using dfs to differentiate clusters
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
    //Connect the clusters
    for (let i = 0; i < rest.length - 1; i++) {
        nodes[rest[i]].push(rest[i + 1]);
    }
    return nodes;
}


function InitializeVilillane(Tree: cfgTrees) {
    //get itemList for display items
    let itemsList: maps = Tree.getItemsList();
    //get expandList to generate a expand graph
    let expandList: maps = Tree.getExpandList();
    //get the initialized id pair
    let idLabelPair: { [key: string]: string } = Tree.getIdLabelPair();
    //get the initialized prevname pairs
    let PrevnameList: { [key: string]: string } = Tree.getPrevnameList();
    // agents
    let NPC = addAgent("NPC");
    //items
    //add items to the villanelle
    for (let key of Object.keys(itemsList)) {
        for (let i = 0; i < itemsList[key].length; i++) {
            addItem(itemsList[key][i]);
            setItemVariable(itemsList[key][i], "currentLocation", key);
        }
    }

    //Generate the expandGraph from the modified expandList
    //For each expandable location, the dictionary contains a randomly connected graph for all its children
    //The graph is one direction
    let expandGraph: { [key: string]: maps } = {};
    for (let keys of Object.keys(expandList)) {
        expandGraph[keys] = connectNodes(expandList[keys]);
    }

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

    //Initialize locations to assign items and agent
    let locations = Object.keys(locationGraph);
    //Initialize player to be at one of the entrance of all universities
    let allUniversity = expandList[Tree.getValue()];

// variables
    let itemDisplay = setVariable("itemDisplay", false);
    let inventory = setVariable("inventory", []);
    let selected = setVariable("selected", false);
    let endGame = setVariable("endGame", false);
    let selectedUniversity = setVariable("selectedUniversity", false);
    let meet = setVariable("meet", false);


//NPC
    setAgentVariable(NPC, "currentLocation", retRand(locations));
//player
    let playerLocation = setVariable("playerLocation", retRand(allUniversity));

// 2. Define BTs

    //recover the array of all universities and location
    locations = Object.keys(locationGraph);
    allUniversity = expandList[Tree.getValue()];

    let setRandNumber = action(
        () => true,
        () => {
            setVariable("randNumber", getRandNumber(1, locations.length));
        },
        0
    );
    //Initialize behavior tree for NPCs
    let BTlist: Tick[] = [];
    for (let i = 0; i < locations.length; i++) {
        //console.log(locations[i]);
        let actions: Tick = action(() => getVariable("randNumber") == i + 1, () => setVariable("destination", locations[i]), 0);
        BTlist.push(actions);
    }
    let atDestination: Precondition = () => getVariable("destination") == getAgentVariable(NPC, "currentLocation");
    let setDestinationPrecond: Precondition = () => isVariableNotSet("destination") || atDestination();

// create behavior trees
    let setNextDestination = sequence([
        setRandNumber,
        selector(BTlist),
    ]);

    let gotoNextLocation = action(
        () => true,
        () => {
            setAgentVariable(NPC, "currentLocation", getNextLocation(getAgentVariable(NPC, "currentLocation"), getVariable("destination")));
            console.log("NPC is at: " + getAgentVariable(NPC, "currentLocation"))
        },
        0
    );
    //agents BT for player meeting the agents
    let setRandNumber_2 = action(
        () => true,
        () => {
            setVariable("randNumber", getRandNumber(1, 3));
        },
        0
    );
    let meetPlayer = sequence([setRandNumber_2,
        guard(() => getAgentVariable(NPC, "currentLocation") == getVariable(playerLocation),
            selector([
                action(() => getVariable("randNumber") == 1, () => {
                    setVariable('endMethod', 'love');
                    setVariable(selectedUniversity, get_uni(getVariable(playerLocation)));
                    setVariable(endGame, true);
                }, 0),
                action(() => getVariable("randNumber") == 2, () => {
                    setVariable('endMethod', 'die');
                    setVariable(endGame, true);
                }, 0),
                action(() => getVariable("randNumber") == 3, () =>
                    setVariable(meet, true), 0)
            ]))]);


    let search = sequence([
        selector([
            guard(setDestinationPrecond, setNextDestination),
            action(() => true, () => {
            }, 0)
        ]),
        gotoNextLocation,
    ]);

    let NPCBT = selector([
        meetPlayer,
        sequence([
            search, meetPlayer
        ])
    ]);

//attach behaviour trees to agents
    attachTreeToAgent(NPC, NPCBT);

    //a function to determine which university the current location is in
    function get_uni(loc: string): string {
        var uni: string = loc;
        while (PrevnameList[uni] != Tree.getValue()) {
            uni = PrevnameList[uni];
        }
        return uni;
    }

    // 3. Construct story

    // create user actions from the graphs
    for (let key in locationGraph) {
        let seq: any[] = [];
        seq.push(displayDescriptionAction("You enter the " + idLabelPair[key] + "."));
        seq.push(addUserAction("Select University.", () => setVariable(selected, true)));
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

        let StateBT = guard(() => getVariable(playerLocation) == key &&
            getVariable(itemDisplay) == false &&
            getVariable(selected) == false &&
            getVariable(endGame) == false,
            sequence(seq));
        addUserInteractionTree(StateBT);
    }

    //Behavior tree for displaying items
    let showitemBT = guard(() => !isUndefined(itemsList[getVariable(playerLocation)]) && itemsList[getVariable(playerLocation)].length != 0 && getVariable(itemDisplay) == false,
        sequence([
                displayDescriptionAction("You notice items lying around."),
                addUserAction("show all the items", () => setVariable(itemDisplay, true))
            ]
        ));
    //attach the bt to thr tree
    addUserInteractionTree(showitemBT);

    //Create behavior trees for every items
    for (let i = 0; i < items.length; i++) {
        let ItemBT = guard(() => getVariable(playerLocation) == getItemVariable(items[i], "currentLocation")
            && getVariable(itemDisplay) == true,
            sequence([
                addUserAction("Pick up the " + idLabelPair[items[i]] + ".", () => {
                    setVariable(itemDisplay, false);
                    let curInv = getVariable(inventory);
                    curInv.push(items[i]);
                    itemsList[getVariable(playerLocation)].splice(itemsList[getVariable(playerLocation)].indexOf(items[i]), 1);
                    displayActionEffectText("You pick up the " + items[i] + ".");
                    setItemVariable(items[i], "currentLocation", "player");
                    setVariable(inventory, curInv)
                })]
            ));
        addUserInteractionTree(ItemBT);
    }

    //BT for selecting universities
    var universitySeq: any[] = [];
    for (let i = 0; i < allUniversity.length; i++) {
        universitySeq.push(addUserAction("select " + allUniversity[i] + ".", () => {
            setVariable(selectedUniversity, allUniversity[i]);
            setVariable('endMethod', 'select');
            setVariable(endGame, true);
        }));
    }
    let universityBT = guard(() => getVariable(selected) == true && getVariable(endGame) == false,
        sequence(universitySeq));
    addUserInteractionTree(universityBT);
    //Interaction BT for displaying meeting description 
    let meetBT = guard(() => getVariable(meet) == true,
        sequence([
            action(() => true, () => setVariable(meet, false), 0),
            displayDescriptionAction("Nothing happens between you and the stranger")]));
    addUserInteractionTree(meetBT);

    //BT for location description
    for (let i = 0; i < locations.length; i++) {
        let rand = Math.random();
        if (rand < 0.1) {
            let brokenBT = guard(() => getVariable(playerLocation) == locations[i] &&
                getVariable(itemDisplay) == false &&
                getVariable(selected) == false &&
                getVariable(endGame) == false,
                sequence([
                    displayDescriptionAction('The place you enter is broken!')
                ]));
            addUserInteractionTree(brokenBT);
        } else if (rand < 0.2) {
            let fancyBT = guard(() => getVariable(playerLocation) == locations[i] &&
                getVariable(itemDisplay) == false &&
                getVariable(selected) == false &&
                getVariable(endGame) == false,
                sequence([
                    displayDescriptionAction('The place you enter is fancy!')
                ]));
            addUserInteractionTree(fancyBT);
        }
    }
    //BT for end of the game
    //The game may end when the player select university 
    //Or the player meet an agent and fall in love with him 
    //Or the player meet an agent and accidentally killed by him
    let gameOver = guard(() => getVariable(endGame) == true,
        selector([
                action(
                    () => getVariable('endMethod') == 'select',
                    () => {
                        userInteractionObject.text += "\n" + "You decide to go to " + getVariable(selectedUniversity) + "!"
                    }, 0
                ),
                action(
                    () => getVariable('endMethod') == 'love',
                    () => {
                        userInteractionObject.text += "\n" + "You fall in love with the one you met, finally decide go to " +
                            getVariable(selectedUniversity) + '!'
                    }, 0
                ),
                guard(() => getVariable('endMethod') == 'die',
                    displayDescriptionAction("Sadly, You are killed by the stranger you meet!"))
            ]
        ))
    ;
    addUserInteractionTree(gameOver);

//Initialize sigma for player and NPC
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

    let sigmaNPC = new sigma({
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
    let edgeID: number = 0;

    //Clear up the graph.
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
        sigmaNPC, sigmaNPC.renderers[0]);

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
        //get all the parents locations of the agents
        let NPCPrevs: string[] = [];
        let playerPrevs: string[] = [];
        let NPCPrevLocs: string;
        let PlayerPrevLocs: string;
        //get agents' current location
        let NPCLocation = getAgentVariable(NPC, "currentLocation");
        let playerL = getVariable(playerLocation);
        //generate all the parents locations of the NPC
        NPCPrevLocs = PrevnameList[NPCLocation];
        while (NPCPrevLocs != Tree.getValue()) {
            NPCPrevs.push(NPCPrevLocs);
            NPCPrevLocs = PrevnameList[NPCPrevLocs];
        }
        //generate all the parents locations of the player
        PlayerPrevLocs = PrevnameList[playerL];
        while (PlayerPrevLocs != Tree.getValue()) {
            playerPrevs.push(PlayerPrevLocs);
            PlayerPrevLocs = PrevnameList[PlayerPrevLocs];
        }
        //Clear the previous scene
        clear(sigmaPlayer);
        clear(sigmaNPC);
        //Show
        show(playerL, sigmaPlayer);
        show(NPCLocation, sigmaNPC);
        //Modify the level indicator for player perspective
        var playerText = document.getElementsByClassName("lefttext");
        var playerinnerHtml: string = '';
        for (var i = 0; i <= playerPrevs.length; i++) {
            playerinnerHtml += '<span class="playerdot"></span>';
        }
        //adding higher level location names for player perspective
        if (PrevnameList[playerL] == Tree.getValue()) {
            playerinnerHtml += '  ' + Tree.getValue() + '/';
        } else {
            playerinnerHtml += '  ' + PrevnameList[PrevnameList[playerL]] + '/';
            playerinnerHtml += PrevnameList[playerL] + '/';
        }
        //Modify the level indicator for player perspective
        playerText[0].innerHTML = playerinnerHtml;
        var AgentText = document.getElementsByClassName("righttext");
        var AgentinnerHtml: string = '';
        for (var i = 0; i <= NPCPrevs.length; i++) {
            AgentinnerHtml += '<span class="agentdot"></span>';
        }
        //adding higher level location names for agent perspective
        if (PrevnameList[NPCLocation] == Tree.getValue()) {
            AgentinnerHtml += '  ' + Tree.getValue() + '/';
        } else {
            AgentinnerHtml += '  ' + PrevnameList[PrevnameList[NPCLocation]] + '/';
            AgentinnerHtml += PrevnameList[NPCLocation] + '/';
        }
        AgentText[0].innerHTML = AgentinnerHtml;
        //show the locations of player and agents on the graph
        //the image of boy from http://www.urltarget.com/icon-symbol-people-boy-man-male-cartoon-scout.html
        for (let node of sigmaPlayer.graph.nodes()) {
            if (node.id == NPCLocation) {
                node.image = {url: '../images/boy.png'};
            }
            if (node.id == playerL) {
                node.image = {url: '../images/player2.png'};
            }
            if (NPCPrevs.includes(node.id)) {
                node.border_color = '#ff0000';
            }
            if (!isUndefined(itemsList[node.id]) && itemsList[node.id].length != 0) {
                node.border_color = '#0000FF';
            }
        }
        for (let node of sigmaNPC.graph.nodes()) {
            if (node.id == playerL) {
                node.image = {url: '../images/player2.png'};
            }
            if (node.id == NPCLocation) {
                node.image = {url: '../images/boy.png'};
            }
            if (playerPrevs.includes(node.id)) {
                node.border_color = '#ADFF2F';
            }
        }
        sigmaPlayer.refresh();
        sigmaNPC.refresh();

        //algorithm for no lapping layout.
        let config = {
            nodeMargin: 50,
            gridSize: 5,
        };

        //Configure the algorithm
        let listener1 = sigmaPlayer.configNoverlap(config);
        let listener2 = sigmaNPC.configNoverlap(config);


        //Bind all events:
        listener1.bind('start stop interpolate', function (event: any) {
            console.log(event.type);
        });
        listener2.bind('start stop interpolate', function (event: any) {
            console.log(event.type);
        });

        //Start the algorithm:
        sigmaPlayer.startNoverlap();
        sigmaNPC.startNoverlap();

        displayTextAndActions();
    }

    //Get canvas
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
    //Initialize the visualization
    render();

    document.addEventListener("keypress", keyPress, false);
    document.addEventListener("keydown", keyDown, false);
}