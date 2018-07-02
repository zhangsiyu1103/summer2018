"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let files = ["../data/university.csv", "../data/LastNames.csv"];
let sigma = require('sigma');
window.sigma = sigma;
require('sigma/plugins/sigma.plugins.dragNodes/sigma.plugins.dragNodes');
require('sigma/plugins/sigma.plugins.animate/sigma.plugins.animate');
require('sigma/plugins/sigma.layout.noverlap/sigma.layout.noverlap');
require('sigma/src/middlewares/sigma.middlewares.rescale');
function getRandNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
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
            console.log(rows);
            BuildingList[rows[0]] = getRandNumber(Number(rows[1]), Number(rows[2]));
        }
        PrefixList = data[1];
        for (var key in BuildingList) {
            for (let j = 0; j < BuildingList[key]; j++) {
                let index = getRandNumber(0, PrefixList.length - 1);
                returnList.push(PrefixList[index] + " " + key);
                PrefixList.splice(index, 1);
            }
        }
        return Promise.resolve(returnList);
    });
}
readFiles().then(function (value) {
    var locationGraph = connectNodes(value);
    visualize(locationGraph);
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
function visualize(locationGraph) {
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
    for (var locations in locationGraph) {
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
    for (var locations in locationGraph) {
        let adjacent = locationGraph[locations];
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
