var Dracula = require('graphdracula');


var Graph = Dracula.Graph;
var Renderer = Dracula.Renderer.Raphael;
var Layout = Dracula.Layout.Spring;

var graph = new Graph();


graph.addEdge('diningroom', 'kitchen');
graph.addEdge('livingroom', 'diningroom')
graph.addEdge('livingroom', 'restroom1');
graph.addEdge('livingroom', 'stairs');
graph.addEdge('stairs', 'restroom2');
graph.addEdge('restroom2', 'bedroom1');
graph.addEdge('bedroom1', 'bedroom2');

var layout = new Layout(graph)
var renderer = new Renderer('#canvas', graph, 600, 400);
renderer.draw()
