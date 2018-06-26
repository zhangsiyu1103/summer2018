//function for random color
//Taken from https://stackoverflow.com/questions/1484506/random-color-generator
let sigma = require('sigma');
(<any>window).sigma = sigma;
require('sigma/plugins/sigma.plugins.dragNodes/sigma.plugins.dragNodes');
require('sigma/plugins/sigma.plugins.animate/sigma.plugins.animate');
require('sigma/plugins/sigma.layout.noverlap/sigma.layout.noverlap');
require('sigma/src/middlewares/sigma.middlewares.rescale');

// 1. Define State
// locations
var START = "START";
var BC_CORRIDOR = "BC_CORRIDOR";
var BL_CORRIDOR = "BL_CORRIDOR";
var BR_CORRIDOR = "BR_CORRIDOR";
var ML_CORRIDOR = "ML_CORRIDOR";
var TL_CORRIDOR = "TL_CORRIDOR";
var TC_CORRIDOR = "TC_CORRIDOR";
var TR_CORRIDOR = "TR_CORRIDOR";
var MR_CORRIDOR = "MR_CORRIDOR";
var LAB = "LAB";
var STORAGE = "STORAGE";
var MEDICAL = "MEDICAL";
var QUARTERS1 = "QUARTERS1";
var QUARTERS2 = "QUARTERS2";
var EXIT_ELEVATOR = "EXIT_ELEVATOR";
var ENGINES = "ENGINES";
var COCKPIT = "COCKPIT";
var COMMS = "COMMS";


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
        //autoRescale:false,
        defaultNodeType: 'border'
    }
});
sigmaInstance.graph.addNode({
    // Main attributes:
    id: START,
    label: START,
    x: Math.random(),
    y: Math.random(),
    size: 17,
    color: '#fff',
    borderColor: getRandomColor()
}).addNode({
    // Main attributes:
    id: BC_CORRIDOR,
    label: BC_CORRIDOR,
    x: Math.random(),
    y: Math.random(),
    size: 17,
    color: '#fff',
    borderColor: getRandomColor()
}).addNode({
    // Main attributes:
    id: BL_CORRIDOR,
    label: BL_CORRIDOR,
    x: Math.random(),
    y: Math.random(),
    size: 17,
    color: '#fff',
    borderColor: getRandomColor()
}).addNode({
    // Main attributes:
    id: BR_CORRIDOR,
    label: BR_CORRIDOR,
    x: Math.random(),
    y: Math.random(),
    size: 17,
    color: '#fff',
    borderColor: getRandomColor()
}).addNode({
    // Main attributes:
    id: ML_CORRIDOR,
    label: ML_CORRIDOR,
    x: Math.random(),
    y: Math.random(),
    size: 17,
    color: '#fff',
    borderColor: getRandomColor()
}).addNode({
    // Main attributes:
    id: TL_CORRIDOR,
    label: TL_CORRIDOR,
    x: Math.random(),
    y: Math.random(),
    size: 17,
    color: '#fff',
    borderColor: getRandomColor()
}).addNode({
    // Main attributes:
    id: TC_CORRIDOR,
    label: TC_CORRIDOR,
    x: Math.random(),
    y: Math.random(),
    size: 17,
    color: '#fff',
    borderColor: getRandomColor()
}).addNode({
    // Main attributes:
    id: TR_CORRIDOR,
    label: TR_CORRIDOR,
    x: Math.random(),
    y: Math.random(),
    size: 17,
    color: '#fff',
    borderColor: getRandomColor()
}).addNode({
    // Main attributes:
    id: MR_CORRIDOR,
    label: MR_CORRIDOR,
    x: Math.random(),
    y: Math.random(),
    size: 17,
    color: '#fff',
    borderColor: getRandomColor()
}).addNode({
    // Main attributes:
    id: LAB,
    label: LAB,
    x: Math.random(),
    y: Math.random(),
    size: 17,
    color: '#fff',
    borderColor: getRandomColor()
}).addNode({
    // Main attributes:
    id: STORAGE,
    label: STORAGE,
    x: Math.random(),
    y: Math.random(),
    size: 17,
    color: '#fff',
    borderColor: getRandomColor()
}).addNode({
    // Main attributes:
    id: MEDICAL,
    label: MEDICAL,
    x: Math.random(),
    y: Math.random(),
    size: 17,
    color: '#fff',
    borderColor: getRandomColor()
}).addNode({
    // Main attributes:
    id: QUARTERS1,
    label: QUARTERS1,
    x: Math.random(),
    y: Math.random(),
    size: 17,
    color: '#fff',
    borderColor: getRandomColor()
}).addNode({
    // Main attributes:
    id: QUARTERS2,
    label: QUARTERS2,
    x: Math.random(),
    y: Math.random(),
    size: 17,
    color: '#fff',
    borderColor: getRandomColor()
}).addNode({
    // Main attributes:
    id: EXIT_ELEVATOR,
    label: EXIT_ELEVATOR,
    x: Math.random(),
    y: Math.random(),
    size: 17,
    color: '#fff',
    borderColor: getRandomColor()
}).addNode({
    // Main attributes:
    id: ENGINES,
    label: ENGINES,
    x: Math.random(),
    y: Math.random(),
    size: 17,
    color: '#fff',
    borderColor: getRandomColor()
}).addNode({
    // Main attributes:
    id: COCKPIT,
    label: COCKPIT,
    x: Math.random(),
    y: Math.random(),
    size: 17,
    color: '#fff',
    borderColor: getRandomColor()
}).addNode({
    // Main attributes:
    id: COMMS,
    label: COMMS,
    x: Math.random(),
    y: Math.random(),
    size: 17,
    color: '#fff',
    borderColor: getRandomColor()
});
var i: number = 1;
sigmaInstance.graph.addEdge({
    id: 'e' + (i++).toString(),
    // Reference extremities:
    source: START,
    target: BC_CORRIDOR,
    color: '#000',
    size: Math.random()
}).addEdge({
    id: 'e' + (i++).toString(),
    // Reference extremities:
    source: BC_CORRIDOR,
    target: BL_CORRIDOR,
    color: '#000',
    size: Math.random()
}).addEdge({
    id: 'e' + (i++).toString(),
    // Reference extremities:
    source: BR_CORRIDOR,
    target: BC_CORRIDOR,
    color: '#000',
    size: Math.random()
}).addEdge({
    id: 'e' + (i++).toString(),
    // Reference extremities:
    source: LAB,
    target: BC_CORRIDOR,
    color: '#000',
    size: Math.random()
}).addEdge({
    id: 'e' + (i++).toString(),
    // Reference extremities:
    source: BL_CORRIDOR,
    target: ML_CORRIDOR,
    color: '#000',
    size: Math.random()
}).addEdge({
    id: 'e' + (i++).toString(),
    // Reference extremities:
    source: ML_CORRIDOR,
    target: STORAGE,
    color: '#000',
    size: Math.random()
}).addEdge({
    id: 'e' + (i++).toString(),
    // Reference extremities:
    source: ML_CORRIDOR,
    target: TL_CORRIDOR,
    color: '#000',
    size: Math.random()
}).addEdge({
    id: 'e' + (i++).toString(),
    // Reference extremities:
    source: TL_CORRIDOR,
    target: TC_CORRIDOR,
    color: '#000',
    size: Math.random()
}).addEdge({
    id: 'e' + (i++).toString(),
    // Reference extremities:
    source: TL_CORRIDOR,
    target: ENGINES,
    color: '#000',
    size: Math.random()
}).addEdge({
    id: 'e' + (i++).toString(),
    // Reference extremities:
    source: TL_CORRIDOR,
    target: COMMS,
    color: '#000',
    size: Math.random()
}).addEdge({
    id: 'e' + (i++).toString(),
    // Reference extremities:
    source: ENGINES,
    target: COCKPIT,
    color: '#000',
    size: Math.random()
}).addEdge({
    id: 'e' + (i++).toString(),
    // Reference extremities:
    source: COCKPIT,
    target: COMMS,
    color: '#000',
    size: Math.random()
}).addEdge({
    id: 'e' + (i++).toString(),
    // Reference extremities:
    source: TC_CORRIDOR,
    target: EXIT_ELEVATOR,
    color: '#000',
    size: Math.random()
}).addEdge({
    id: 'e' + (i++).toString(),
    // Reference extremities:
    source: TC_CORRIDOR,
    target: MEDICAL,
    color: '#000',
    size: Math.random()
}).addEdge({
    id: 'e' + (i++).toString(),
    // Reference extremities:
    source: TC_CORRIDOR,
    target: TR_CORRIDOR,
    color: '#000',
    size: Math.random()
}).addEdge({
    id: 'e' + (i++).toString(),
    // Reference extremities:
    source: TR_CORRIDOR,
    target: MR_CORRIDOR,
    color: '#000',
    size: Math.random()
}).addEdge({
    id: 'e' + (i++).toString(),
    // Reference extremities:
    source: MR_CORRIDOR,
    target: MEDICAL,
    color: '#000',
    size: Math.random()
}).addEdge({
    id: 'e' + (i++).toString(),
    // Reference extremities:
    source: MR_CORRIDOR,
    target: QUARTERS2,
    color: '#000',
    size: Math.random()
}).addEdge({
    id: 'e' + (i++).toString(),
    // Reference extremities:
    source: MR_CORRIDOR,
    target: BR_CORRIDOR,
    color: '#000',
    size: Math.random()
}).addEdge({
    id: 'e' + (i++).toString(),
    // Reference extremities:
    source: BR_CORRIDOR,
    target: QUARTERS1,
    color: '#000',
    size: Math.random()
}).addEdge({
    id: 'e' + (i++).toString(),
    // Reference extremities:
    source: QUARTERS1,
    target: BR_CORRIDOR,
    color: '#000',
    size: Math.random()
});

sigmaInstance.refresh();

var config = {
    nodeMargin: 1.0,
    scaleNodes: 4
};

// Configure the algorithm
var listener = sigmaInstance.configNoverlap(config);

// Bind all events:
listener.bind('start stop interpolate', function (event: any) {
    console.log(event.type);
});

// Start the algorithm:
sigmaInstance.startNoverlap();

//sigmaInstance.middlewares.rescale();
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





