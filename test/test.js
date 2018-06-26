// Let's first initialize sigma:
var sigma = require('sigma');
window.sigma = sigma;
require('sigma/plugins/sigma.plugins.dragNodes/sigma.plugins.dragNodes');
require('sigma/plugins/sigma.plugins.animate/sigma.plugins.animate');
require('sigma/plugins/sigma.layout.noverlap/sigma.layout.noverlap');
// Let's first initialize sigma:
var sigmaInstance = new sigma({
    graph: {
        nodes: [],
        edges: []
    },
    renderer: {
        container: 'graph-container'
    },
    settings: {
        defaultNodeColor: '#fff'
    }
});
sigmaInstance.settings('defaultNodeType','border');
//Initialize houses
var expand = [];
expand["house1"] = ["livingroom1", "kitchen1", "restroom1"];
expand["house2"] = ["livingroom2", "kitchen2", "restroom2"];
expand["house3"] = ["livingroom3", "kitchen3", "restroom3"];
expand["livingroom1"] = ["sofa1", "tv1"];
expand["restroom1"] = ["toilet1", "bath1"];
expand["livingroom2"] = ["sofa2", "tv2"];
expand["restroom2"] = ["toilet2", "bath2"];
expand["livingroom3"] = ["sofa3", "tv3"];
expand["restroom3"] = ["toilet3", "bath3"];


var edges = [];
edges["house1"] = [["livingroom1", "kitchen1"], ["livingroom1", "restroom1"]];
edges["house2"] = [["livingroom2", "kitchen2"], ["livingroom2", "restroom2"]];
edges["house3"] = [["livingroom3", "kitchen3"], ["livingroom3", "restroom3"]];

var bool = [];
bool["house1"] = false;
bool["house2"] = false;
bool["house3"] = false;
bool["livingroom1"] = false;
bool["restroom1"] = false;
bool["livingroom2"] = false;
bool["restroom2"] = false;
bool["livingroom3"] = false;
bool["restroom3"] = false;


sigma.canvas.nodes.border = function (node, context, settings) {


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

function remove_connect(node_id) {
    if (Object.keys(expand).includes(node_id)) {
        bool[node_id] = false;
        var related = expand[node_id];
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

function newNodes(node_t) {
    if (Object.keys(expand).includes(node_t.label)) {
        bool[node_t.label] = true;
        var related = expand[node_t.label];
        var subedges = edges[node_t.label];
        var i;
        for (i = 0; i < related.length; i++) {
            sigmaInstance.graph.addNode({
                // Main attributes:
                id: related[i],
                label: related[i],
                // Display attributes:
                x: node_t.x + Math.random() / 3,
                y: node_t.y + Math.random() / 3,
                size: 20,
                color: 'fff',
                borderColor: '#b956af'
            });
        }
        if (Object.keys(edges).includes(node_t.label)) {
            sigmaInstance.graph.addEdge({
                id: "new edge" + Math.random(),
                // Reference extremities:
                source: subedges[0][0],
                target: node_t.id,
                size: Math.random(),
                color: '#668e3e'
            });
            for (i = 0; i < subedges.length; i++) {
                sigmaInstance.graph.addEdge({
                    id: "new edge" + Math.random(),
                    // Reference extremities:
                    source: subedges[i][0],
                    target: subedges[i][1],
                    size: Math.random(),
                    color: '#668e3e'
                });
            }
        } else {
            for (i = 0; i < related.length; i++) {
                sigmaInstance.graph.addEdge({
                    id: "new edge" + Math.random(),
                    // Reference extremities:
                    source: node_t.id,
                    target: related[i],
                    size: Math.random(),
                    color: '#668e3e'
                });
            }
        }
        setTimeout(function () {
            sigmaInstance.refresh();
            sigmaInstance.startNoverlap();
        }, 500);
    }
}


// Then, let's add some data to display:
sigmaInstance.graph.addNode({
    // Main attributes:
    id: 'house1',
    label: 'house1',
    // Display attributes:
    x: Math.random(),
    y: Math.random(),
    size: 20,
    color: '#fff',
    borderColor: '#f00'
}).addNode({
    // Main attributes:
    id: 'house2',
    label: 'house2',
    // Display attributes:
    x: Math.random(),
    y: Math.random(),
    size: 20,
    color: '#fff',
    borderColor: '#00f'
}).addNode({
    // Main attributes:
    id: 'house3',
    label: 'house3',
    // Display attributes:
    x: Math.random(),
    y: Math.random(),
    size: 20,
    color: '#fff',
    borderColor: '#0ff'
}).addEdge({
    id: 'e0',
    // Reference extremities:
    source: 'house1',
    target: 'house2',
    color: '#000',
    size: Math.random()
}).addEdge({
    id: 'e1',
    // Reference extremities:
    source: 'house2',
    target: 'house3',
    color: '#000',
    size: Math.random()
});
sigmaInstance.refresh();

var config = {
    nodeMargin: 40.0,
    scaleNodes: 10
};

// Configure the algorithm
var listener = sigmaInstance.configNoverlap(config);

console.log(typeof listener);

// Bind all events:
listener.bind('start stop interpolate', function(event) {
    console.log(event.type);
});

// Start the algorithm:
sigmaInstance.startNoverlap();

// Initialize the dragNodes plugin:
sigmaInstance.bind('clickNode', click_node_function);
var dragListener = sigma.plugins.dragNodes(
    sigmaInstance, sigmaInstance.renderers[0]);

dragListener.bind('startdrag', function (event) {
    console.log(event);
});
dragListener.bind('drag', function (event) {
    console.log(event);
    sigmaInstance.unbind('clickNode');
});
dragListener.bind('drop', function (event) {
    console.log(event);
    setTimeout(function () {
        sigmaInstance.bind('clickNode', click_node_function);
    }, 200)
});
dragListener.bind('dragend', function (event) {
    console.log(event);
});

function click_node_function(event) {
    console.log(event);
    if (bool[event.data.node.label] == false) {
        //newNodes(event.data.node);
        console.log(event.data.node.x + ", " + event.data.node.y);
    } else {
        //remove_connect(event.data.node.id);
    }
}
