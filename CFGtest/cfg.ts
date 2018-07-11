//The gramma for university is generated after viewing the maps of five universities: UCSD;NCSU;UNC;DUKE;GRINNELL
//The Prefix is taken from http://www.quietaffiliate.com/free-first-name-and-last-name-databases-csv-and-sql/
let files = ["cfgGramma", "Prefix"]
let filesuffix = '.csv'
let sigma = require('sigma');
(<any>window).sigma = sigma;
require('sigma/plugins/sigma.plugins.dragNodes/sigma.plugins.dragNodes');
require('sigma/plugins/sigma.plugins.animate/sigma.plugins.animate');
require('sigma/plugins/sigma.layout.noverlap/sigma.layout.noverlap');
require('sigma/src/middlewares/sigma.middlewares.rescale');

//Context free gramma initialization
type maps = { [key: string]: string[] };

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

function getRandNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function retRand(list: any[]) {
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
                req.open("GET", file + filesuffix, true);
                req.responseType = "text";
                req.send(null);
            }
        );
    }

    return Promise.resolve(data);
}

readFiles().then(function (value) {
    var tree: cfgTrees = processData(value);
    //console.log(tree.getExpandList());
    //tree.print();
    visualize(tree);
})

function combine(dict1: { [key: string]: any }, dict2: { [key: string]: any }): { [key: string]: any } {
    for (var val of Object.keys(dict2)) {
        dict1[val] = dict2[val];
    }
    return dict1;
}


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
        if ((typeof nodes[location[i]]) === 'undefined') {
            nodes[location[i]] = []
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


function visualize(Tree: cfgTrees) {
    var expandGraph: { [key: string]: maps } = Tree.getExpandGraph();
    var expandList: maps = Tree.getExpandList();
    var idLabelPair: { [key: string]: string } = Tree.getIdLabelPair();
    var bool: { [keys: string]: boolean } = {};
    for (var val of Tree.getAllValues()) {
        bool[val] = false;
    }
    console.log(expandList);
    var edgeID: number = 0;
    var InitialGraph = expandGraph[Tree.getValue()];


    function remove_connect(node_id: string) {
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
            }, 500)
        }
    }

    function newNodes(node_t:any) {
        if (Object.keys(expandGraph).includes(node_t.id)) {
            bool[node_t.id] = true;
            var newlocations = expandGraph[node_t.id];
            show(newlocations);
            sigmaInstance.graph.addEdge({
                id: 'e' + (edgeID++).toString(),
                source: node_t.id,
                target: expandList[node_t.id][0],
                size: 10
            })

            setTimeout(function () {
                sigmaInstance.refresh();
                sigmaInstance.startNoverlap();
            }, 500);
        }
    }

    function show(locationGraph: maps) {
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
            let adjacent = locationGraph[locations];
            for (var adj of adjacent) {
                sigmaInstance.graph.addEdge({
                    id: 'e' + (edgeID++).toString(),
                    source: locations,
                    target: adj,
                    size: 10
                })
            }
        }
    }

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

    show(InitialGraph);

    sigmaInstance.bind('clickNode', click_node_function);
    var dragListener = sigma.plugins.dragNodes(
        sigmaInstance, sigmaInstance.renderers[0]);

    dragListener.bind('startdrag', function (event:any) {
        console.log(event);
    });

    dragListener.bind('drag', function (event:any) {
        console.log(event);
        sigmaInstance.unbind('clickNode');
    });

    dragListener.bind('drop', function (event:any) {
        console.log(event);
        setTimeout(function () {
            sigmaInstance.bind('clickNode', click_node_function);
        }, 200)
    });

    dragListener.bind('dragend', function (event:any) {
        console.log(event);
    });

    sigmaInstance.refresh();
    function click_node_function(event:any) {
        if (bool[event.data.node.id] == false) {
            newNodes(event.data.node);
        } else {
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
    listener.bind('start stop interpolate', function (event: any) {
        console.log(event.type);
    });

//Start the algorithm:
    sigmaInstance.startNoverlap();
}


