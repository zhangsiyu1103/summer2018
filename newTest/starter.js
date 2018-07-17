"use strict";
//function for random color
//Taken from https://stackoverflow.com/questions/1484506/random-color-generator
var sigma = require('linkurious');
window.sigma = sigma;
// require('sigma/plugins/sigma.plugins.dragNodes/sigma.plugins.dragNodes');
// require('sigma/plugins/sigma.plugins.animate/sigma.plugins.animate');
// require('sigma/plugins/sigma.layout.noverlap/sigma.layout.noverlap');
//require('sigma/build/plugins/sigma.renderers.customShapes.min');
require('linkurious/plugins/sigma.plugins.dragNodes/sigma.plugins.dragNodes');
require('linkurious/plugins/sigma.plugins.animate/sigma.plugins.animate');
require('linkurious/plugins/sigma.layouts.noverlap/sigma.layouts.noverlap');
require('linkurious/plugins/sigma.renderers.linkurious/canvas/sigma.canvas.nodes.def');
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
//generate function
function generate(n) {
    var i, j;
    var nodes = {};
    var edges = [];
    var visited = {};
    for (i = 1; i <= n; i++) {
        visited["n" + i.toString()] = false;
    }
    var stack = [];
    var rest = [];
    //randomly generate a graph
    for (i = 1; i <= n; i++) {
        if ((typeof nodes["n" + i.toString()]) === 'undefined') {
            nodes["n" + i.toString()] = [];
        }
        for (j = i + 1; j <= n; j++) {
            if ((typeof nodes["n" + j.toString()]) === 'undefined') {
                nodes["n" + j.toString()] = [];
            }
            if (Math.random() < 0.2) {
                nodes["n" + i.toString()].push("n" + j.toString());
                nodes["n" + j.toString()].push("n" + i.toString());
                edges.push(["n" + j.toString(), "n" + i.toString()]);
            }
        }
    }
    //making sure it is connected
    for (i = 1; i <= n; i++) {
        if (visited["n" + i.toString()] == false) {
            var item = "n" + i.toString();
            stack.push("n" + i.toString());
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
    for (i = 0; i < rest.length - 1; i++) {
        nodes[rest[i]].push(rest[i + 1]);
        nodes[rest[i + 1]].push(rest[i]);
        edges.push([rest[i], rest[i + 1]]);
    }
    //function for random color
    //Taken from https://stackoverflow.com/questions/1484506/random-color-generator
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
            defaultNodeBorderColor: '#f0f',
            defaultNodeHoverBorderColor: '#fff',
            defaultNodeColor: '#000',
            defaultLabelColor: '#fff',
            defaultEdgeColor: '#fff',
            edgeColor: 'default',
            maxNodeSize: 20,
            sideMargin: 15
        }
    });
    // var sigmaInstance = new sigma({
    //     settings: {
    //         nodeBorderSize: 1,
    //         defaultNodeBorderColor: '#fff',
    //         defaultNodeHoverBorderColor: '#fff',
    //
    //     }
    // });
    // sigmaInstance.addRenderer({
    //     container: <Element>document.getElementById('graph-container'),
    //     type:'canvas'
    // })
    for (i = 1; i <= n; i++) {
        sigmaInstance.graph.addNode({
            // Main attributes:
            id: "n" + i.toString(),
            label: 'node ' + i.toString(),
            type: 'image',
            x: Math.random(),
            y: Math.random(),
            size: 1,
        });
    }
    var img = new Image();
    img.src = 'player2.png';
    sigmaInstance.graph.nodes('n1').image = { url: 'player2.png' };
    //add edge
    for (i = 0; i < edges.length; i++) {
        sigmaInstance.graph.addEdge({
            id: 'e' + i.toString(),
            // Reference extremities:
            source: edges[i][0],
            target: edges[i][1],
            color: '#000',
            size: 4
        });
    }
    //CustomShapes.init(sigmaInstance);
    sigmaInstance.refresh();
    var config = {
        nodeMargin: 40.0,
        scaleNodes: 1.3
    };
    // Configure the algorithm
    var listener = sigmaInstance.configNoverlap(config);
    // Bind all events:
    listener.bind('start stop interpolate', function (event) {
        console.log(event.type);
    });
    // Start the algorithm:
    sigmaInstance.startNoverlap();
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
}
generate(10);
