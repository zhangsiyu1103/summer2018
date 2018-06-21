//function for random color
//Taken from https://stackoverflow.com/questions/1484506/random-color-generator
let sigma = require('sigma');
(<any>window).sigma = sigma;
require('sigma/plugins/sigma.plugins.dragNodes/sigma.plugins.dragNodes');
require('sigma/plugins/sigma.plugins.animate/sigma.plugins.animate');
require('sigma/plugins/sigma.layout.noverlap/sigma.layout.noverlap');


function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
//generate function
function generate(n: number){
    let i, j: number;
    let nodes: { [key: string]: string[] } = {};
    let edges: string[][] = [];
    let visited: { [key: string]: boolean } = {};
    for (i = 1; i <= n; i++) {
        visited["n" + i.toString()] = false;
    }
    let stack: string[] = [];
    let rest: string[] = [];
    //randomly generate a graph
    for (i = 1; i <= n; i++) {
        if ((typeof nodes["n" + i.toString()]) === 'undefined') {
            nodes["n" + i.toString()] = []
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
            let item: string = "n" + i.toString();
            stack.push("n" + i.toString());
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
    for (i = 0; i < rest.length - 1; i++) {
        nodes[rest[i]].push(rest[i + 1]);
        nodes[rest[i + 1]].push(rest[i]);
        edges.push([rest[i], rest[i+1]]);
    }

    // var sigmaInstance = new sig
//function for random color
//Taken from https://stackoverflow.com/questions/1484506/random-color-generator
    sigma.canvas.nodes.border = function (node:any, context:any, settings:any) {
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
        settings: {
            defaultNodeType: 'border',
        }
    });
    sigmaInstance.addRenderer({
        container: <Element>document.getElementById('graph-container'),
        type:'canvas'
    })
    for(i = 1; i <= n; i++){
        sigmaInstance.graph.addNode({
            // Main attributes:
            id: "n" + i.toString(),
            label: 'node ' + i.toString(),
            Type: 'border',
            x: Math.random(),
            y: Math.random(),
            size: 1,
            color: '#fff',
            borderColor: getRandomColor()
        })
    }

    //add edge
    for(i = 0; i < edges.length; i++){
        sigmaInstance.graph.addEdge({
            id: 'e' + i.toString(),
            // Reference extremities:
            source: edges[i][0],
            target: edges[i][1],
            color: '#000',
            size: Math.random()
        });

    }

    sigmaInstance.refresh();

    var config = {
        nodeMargin: 40.0,
        scaleNodes: 1.3
    };

// Configure the algorithm
    var listener = sigmaInstance.configNoverlap(config);

// Bind all events:
    listener.bind('start stop interpolate', function(event:any) {
        console.log(event.type);
    });

// Start the algorithm:
    sigmaInstance.startNoverlap();


    var dragListener = sigma.plugins.dragNodes(
        sigmaInstance, sigmaInstance.renderers[0]);

    dragListener.bind('startdrag', function(event:string) {
        console.log(event);
    });
    dragListener.bind('drag', function(event:string) {
        console.log(event);
    });
    dragListener.bind('drop', function(event:string) {
        console.log(event);
    });
    dragListener.bind('dragend', function(event:string) {
        console.log(event);
    });
}

generate(50);



