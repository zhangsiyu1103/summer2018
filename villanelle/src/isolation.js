"use strict";
exports.__esModule = true;
/* /// <reference path="scripting.ts"/> */
var scripting_1 = require("./scripting");
var util_1 = require("typescript-collections/dist/lib/util");
var sigma = require('sigma');
window.sigma = sigma;
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
scripting_1.addLocation(START, [BC_CORRIDOR]);
scripting_1.addLocation(BC_CORRIDOR, [BL_CORRIDOR, BR_CORRIDOR, LAB]);
scripting_1.addLocation(BL_CORRIDOR, [ML_CORRIDOR]);
scripting_1.addLocation(ML_CORRIDOR, [STORAGE, TL_CORRIDOR]);
scripting_1.addLocation(TL_CORRIDOR, [TC_CORRIDOR, ENGINES, COMMS]);
scripting_1.addLocation(ENGINES, [COCKPIT]);
scripting_1.addLocation(COCKPIT, [COMMS]);
scripting_1.addLocation(TC_CORRIDOR, [EXIT_ELEVATOR, MEDICAL, TR_CORRIDOR]);
scripting_1.addLocation(TR_CORRIDOR, [MR_CORRIDOR]);
scripting_1.addLocation(MR_CORRIDOR, [MEDICAL, QUARTERS2, BR_CORRIDOR]);
scripting_1.addLocation(BR_CORRIDOR, [QUARTERS1]);
// agents
var alien = scripting_1.addAgent("Alien");
// items
var crewCard1 = scripting_1.addItem("Crew card1");
var crewCard2 = scripting_1.addItem("Crew card2");
scripting_1.setItemVariable(crewCard1, "currentLocation", LAB);
scripting_1.setItemVariable(crewCard2, "currentLocation", MEDICAL);
// variables
//alien
scripting_1.setAgentVariable(alien, "currentLocation", COCKPIT);
//player
var playerLocation = scripting_1.setVariable("playerLocation", START);
var crewCardsCollected = scripting_1.setVariable("crewCardsCollected", 0);
// 2. Define BTs
// create ground actions
var setRandNumber = scripting_1.action(function () { return true; }, function () { return scripting_1.setVariable("randNumber", scripting_1.getRandNumber(1, 18)); }, 0);
var chooseSTART = scripting_1.action(function () { return scripting_1.getVariable("randNumber") == 1; }, function () { return scripting_1.setVariable("destination", START); }, 0);
var chooseBC_CORRIDOR = scripting_1.action(function () { return scripting_1.getVariable("randNumber") == 2; }, function () { return scripting_1.setVariable("destination", BC_CORRIDOR); }, 0);
var chooseBL_CORRIDOR = scripting_1.action(function () { return scripting_1.getVariable("randNumber") == 3; }, function () { return scripting_1.setVariable("destination", BL_CORRIDOR); }, 0);
var chooseBR_CORRIDOR = scripting_1.action(function () { return scripting_1.getVariable("randNumber") == 4; }, function () { return scripting_1.setVariable("destination", BR_CORRIDOR); }, 0);
var chooseML_CORRIDOR = scripting_1.action(function () { return scripting_1.getVariable("randNumber") == 5; }, function () { return scripting_1.setVariable("destination", ML_CORRIDOR); }, 0);
var chooseTL_CORRIDOR = scripting_1.action(function () { return scripting_1.getVariable("randNumber") == 6; }, function () { return scripting_1.setVariable("destination", TL_CORRIDOR); }, 0);
var chooseTC_CORRIDOR = scripting_1.action(function () { return scripting_1.getVariable("randNumber") == 7; }, function () { return scripting_1.setVariable("destination", TC_CORRIDOR); }, 0);
var chooseTR_CORRIDOR = scripting_1.action(function () { return scripting_1.getVariable("randNumber") == 8; }, function () { return scripting_1.setVariable("destination", TR_CORRIDOR); }, 0);
var chooseMR_CORRIDOR = scripting_1.action(function () { return scripting_1.getVariable("randNumber") == 9; }, function () { return scripting_1.setVariable("destination", MR_CORRIDOR); }, 0);
var chooseLAB = scripting_1.action(function () { return scripting_1.getVariable("randNumber") == 10; }, function () { return scripting_1.setVariable("destination", LAB); }, 0);
var chooseSTORAGE = scripting_1.action(function () { return scripting_1.getVariable("randNumber") == 11; }, function () { return scripting_1.setVariable("destination", STORAGE); }, 0);
var chooseMEDICAL = scripting_1.action(function () { return scripting_1.getVariable("randNumber") == 12; }, function () { return scripting_1.setVariable("destination", MEDICAL); }, 0);
var chooseQUARTERS1 = scripting_1.action(function () { return scripting_1.getVariable("randNumber") == 13; }, function () { return scripting_1.setVariable("destination", QUARTERS1); }, 0);
var chooseQUARTERS2 = scripting_1.action(function () { return scripting_1.getVariable("randNumber") == 14; }, function () { return scripting_1.setVariable("destination", QUARTERS2); }, 0);
var chooseEXIT_ELEVATOR = scripting_1.action(function () { return scripting_1.getVariable("randNumber") == 15; }, function () { return scripting_1.setVariable("destination", EXIT_ELEVATOR); }, 0);
var chooseENGINES = scripting_1.action(function () { return scripting_1.getVariable("randNumber") == 16; }, function () { return scripting_1.setVariable("destination", ENGINES); }, 0);
var chooseCOCKPIT = scripting_1.action(function () { return scripting_1.getVariable("randNumber") == 17; }, function () { return scripting_1.setVariable("destination", COCKPIT); }, 0);
var chooseCOMMS = scripting_1.action(function () { return scripting_1.getVariable("randNumber") == 18; }, function () { return scripting_1.setVariable("destination", COMMS); }, 0);
var atDestination = function () { return scripting_1.getVariable("destination") == scripting_1.getAgentVariable(alien, "currentLocation"); };
var setDestinationPrecond = function () { return scripting_1.isVariableNotSet("destination") || atDestination(); };
// create behavior trees
var setNextDestination = scripting_1.sequence([
    setRandNumber,
    scripting_1.selector([
        chooseSTART,
        chooseBC_CORRIDOR,
        chooseBL_CORRIDOR,
        chooseBR_CORRIDOR,
        chooseML_CORRIDOR,
        chooseTL_CORRIDOR,
        chooseTC_CORRIDOR,
        chooseTR_CORRIDOR,
        chooseMR_CORRIDOR,
        chooseLAB,
        chooseSTORAGE,
        chooseMEDICAL,
        chooseQUARTERS1,
        chooseQUARTERS2,
        chooseEXIT_ELEVATOR,
        chooseENGINES,
        chooseCOCKPIT,
        chooseCOMMS
    ])
]);
var gotoNextLocation = scripting_1.action(function () { return true; }, function () {
    scripting_1.setAgentVariable(alien, "currentLocation", scripting_1.getNextLocation(scripting_1.getAgentVariable(alien, "currentLocation"), scripting_1.getVariable("destination")));
    console.log("Alien is at: " + scripting_1.getAgentVariable(alien, "currentLocation"));
}, 0);
var eatPlayer = scripting_1.action(function () { return scripting_1.getAgentVariable(alien, "currentLocation") == scripting_1.getVariable(playerLocation); }, function () {
    scripting_1.setVariable("endGame", "lose");
    scripting_1.setVariable(playerLocation, "NA");
}, 0);
/*let search = selector([
    eatPlayer,
    sequence([
        selector([
            guard(setDestinationPrecond, {}, setNextDestination),
            action(() => true, () => {
            }, {}, 0)
        ]),
        gotoNextLocation,
        eatPlayer
    ])
]);*/
var search = scripting_1.sequence([
    scripting_1.selector([
        scripting_1.guard(setDestinationPrecond, setNextDestination),
        scripting_1.action(function () { return true; }, function () {
        }, 0)
    ]),
    gotoNextLocation,
]);
var alienBT = scripting_1.selector([
    eatPlayer,
    scripting_1.sequence([
        search, eatPlayer
    ])
]);
//attach behaviour trees to agents
scripting_1.attachTreeToAgent(alien, alienBT);
// 3. Construct story
// create user actions
var startStateBT = scripting_1.guard(function () { return scripting_1.getVariable(playerLocation) == START; }, scripting_1.sequence([
    scripting_1.displayDescriptionAction("You enter the docking station."),
    scripting_1.addUserAction("Go forward to enter the corridor", function () { return scripting_1.setVariable(playerLocation, BC_CORRIDOR); }),
    scripting_1.addUserAction("Stay where you are.", function () {
    })
]));
scripting_1.addUserInteractionTree(startStateBT);
var bcStateBT = scripting_1.guard(function () { return scripting_1.getVariable(playerLocation) == BC_CORRIDOR; }, scripting_1.sequence([
    scripting_1.displayDescriptionAction("You enter the corridor."),
    scripting_1.addUserAction("Head west in the corridor", function () { return scripting_1.setVariable(playerLocation, BL_CORRIDOR); }),
    scripting_1.addUserAction("Enter the lab", function () { return scripting_1.setVariable(playerLocation, LAB); }),
    scripting_1.addUserAction("Head east in the corridor", function () { return scripting_1.setVariable(playerLocation, BR_CORRIDOR); }),
    scripting_1.addUserAction("Go back to the start", function () { return scripting_1.setVariable(playerLocation, START); }),
    scripting_1.addUserAction("Stay where you are.", function () {
    })
]));
scripting_1.addUserInteractionTree(bcStateBT);
var brStateBT = scripting_1.guard(function () { return scripting_1.getVariable(playerLocation) == BR_CORRIDOR; }, scripting_1.sequence([
    scripting_1.displayDescriptionAction("You move forward in the corridor."),
    scripting_1.addUserAction("Enter the staff quarters", function () { return scripting_1.setVariable(playerLocation, QUARTERS1); }),
    scripting_1.addUserAction("Move north in the corridor", function () { return scripting_1.setVariable(playerLocation, MR_CORRIDOR); }),
    scripting_1.addUserAction("Head west in the corridor", function () { return scripting_1.setVariable(playerLocation, BC_CORRIDOR); }),
    scripting_1.addUserAction("Stay where you are.", function () {
    })
]));
scripting_1.addUserInteractionTree(brStateBT);
var quarters1BT = scripting_1.guard(function () { return scripting_1.getVariable(playerLocation) == QUARTERS1; }, scripting_1.sequence([
    scripting_1.displayDescriptionAction("You enter the staff quarters."),
    scripting_1.addUserAction("Exit the staff quarters", function () { return scripting_1.setVariable(playerLocation, BR_CORRIDOR); }),
    scripting_1.addUserAction("Stay where you are.", function () {
    })
]));
scripting_1.addUserInteractionTree(quarters1BT);
var mrStateBT = scripting_1.guard(function () { return scripting_1.getVariable(playerLocation) == MR_CORRIDOR; }, scripting_1.sequence([
    scripting_1.displayDescriptionAction("You move forward in the corridor."),
    scripting_1.addUserAction("Enter the captain's quarters on the east", function () { return scripting_1.setVariable(playerLocation, QUARTERS2); }),
    scripting_1.addUserAction("Enter the medical room on the west", function () { return scripting_1.setVariable(playerLocation, MEDICAL); }),
    scripting_1.addUserAction("Move north in the corridor", function () { return scripting_1.setVariable(playerLocation, TR_CORRIDOR); }),
    scripting_1.addUserAction("Move south in the corridor", function () { return scripting_1.setVariable(playerLocation, BR_CORRIDOR); }),
    scripting_1.addUserAction("Stay where you are.", function () {
    })
]));
scripting_1.addUserInteractionTree(mrStateBT);
var quarters2BT = scripting_1.guard(function () { return scripting_1.getVariable(playerLocation) == QUARTERS2; }, scripting_1.sequence([
    scripting_1.displayDescriptionAction("You enter the captain's quarters."),
    scripting_1.addUserAction("Exit the captain's quarters", function () { return scripting_1.setVariable(playerLocation, MR_CORRIDOR); }),
    scripting_1.addUserAction("Stay where you are.", function () {
    })
]));
scripting_1.addUserInteractionTree(quarters2BT);
var medicalBT = scripting_1.guard(function () { return scripting_1.getVariable(playerLocation) == MEDICAL; }, scripting_1.sequence([
    scripting_1.displayDescriptionAction("You enter the medical room."),
    scripting_1.addUserAction("Exit to the north", function () { return scripting_1.setVariable(playerLocation, TC_CORRIDOR); }),
    scripting_1.addUserAction("Exit to the east", function () { return scripting_1.setVariable(playerLocation, MR_CORRIDOR); }),
    scripting_1.addUserAction("Stay where you are.", function () {
    })
]));
scripting_1.addUserInteractionTree(medicalBT);
var labBT = scripting_1.guard(function () { return scripting_1.getVariable(playerLocation) == LAB; }, scripting_1.sequence([
    scripting_1.displayDescriptionAction("You enter the lab."),
    scripting_1.addUserAction("Exit the lab", function () { return scripting_1.setVariable(playerLocation, BC_CORRIDOR); }),
    scripting_1.addUserAction("Stay where you are.", function () {
    })
]));
scripting_1.addUserInteractionTree(labBT);
var trStateBT = scripting_1.guard(function () { return scripting_1.getVariable(playerLocation) == TR_CORRIDOR; }, scripting_1.sequence([
    scripting_1.displayDescriptionAction("You move forward in the corridor."),
    scripting_1.addUserAction("Move to the west", function () { return scripting_1.setVariable(playerLocation, TC_CORRIDOR); }),
    scripting_1.addUserAction("Move to the south", function () { return scripting_1.setVariable(playerLocation, MR_CORRIDOR); }),
    scripting_1.addUserAction("Stay where you are.", function () {
    })
]));
scripting_1.addUserInteractionTree(trStateBT);
var tcStateBT = scripting_1.guard(function () { return scripting_1.getVariable(playerLocation) == TC_CORRIDOR; }, scripting_1.sequence([
    scripting_1.displayDescriptionAction("You move forward in the corridor."),
    scripting_1.addUserAction("Move to the west", function () { return scripting_1.setVariable(playerLocation, TL_CORRIDOR); }),
    scripting_1.addUserAction("Enter the medical room", function () { return scripting_1.setVariable(playerLocation, MEDICAL); }),
    scripting_1.addUserAction("Move towards the elevator", function () { return scripting_1.setVariable(playerLocation, EXIT_ELEVATOR); }),
    scripting_1.addUserAction("Stay where you are.", function () {
    })
]));
scripting_1.addUserInteractionTree(tcStateBT);
var elevatorBT = scripting_1.guard(function () { return scripting_1.getVariable(playerLocation) == EXIT_ELEVATOR; }, scripting_1.sequence([
    scripting_1.displayDescriptionAction("You reach the exit elevator."),
    scripting_1.selector([
        scripting_1.guard(function () { return scripting_1.getVariable(crewCardsCollected) >= 2; }, scripting_1.sequence([
            scripting_1.displayDescriptionAction("You can now activate the exit and flee!"),
            scripting_1.addUserAction("Activate and get out!", function () {
                scripting_1.setVariable("endGame", "win");
                scripting_1.setVariable(playerLocation, "NA");
            })
        ])),
        scripting_1.displayDescriptionAction("You need 2 crew cards to activate the exit elevator system.")
    ]),
    scripting_1.addUserAction("Move back in the corridor", function () { return scripting_1.setVariable(playerLocation, TC_CORRIDOR); }),
    scripting_1.addUserAction("Stay where you are.", function () {
    })
]));
scripting_1.addUserInteractionTree(elevatorBT);
var tlStateBT = scripting_1.guard(function () { return scripting_1.getVariable(playerLocation) == TL_CORRIDOR; }, scripting_1.sequence([
    scripting_1.displayDescriptionAction("You move forward in the corridor."),
    scripting_1.addUserAction("Enter the engines room to the north", function () { return scripting_1.setVariable(playerLocation, ENGINES); }),
    scripting_1.addUserAction("Enter the communications room to the east", function () { return scripting_1.setVariable(playerLocation, COMMS); }),
    scripting_1.addUserAction("Move to the east in the corridor", function () { return scripting_1.setVariable(playerLocation, TC_CORRIDOR); }),
    scripting_1.addUserAction("Move to the south", function () { return scripting_1.setVariable(playerLocation, ML_CORRIDOR); }),
    scripting_1.addUserAction("Stay where you are.", function () {
    })
]));
scripting_1.addUserInteractionTree(tlStateBT);
var blStateBT = scripting_1.guard(function () { return scripting_1.getVariable(playerLocation) == BL_CORRIDOR; }, scripting_1.sequence([
    scripting_1.displayDescriptionAction("You move forward in the corridor."),
    scripting_1.addUserAction("Move to the north in the corridor", function () { return scripting_1.setVariable(playerLocation, ML_CORRIDOR); }),
    scripting_1.addUserAction("Move to the east in the corridor", function () { return scripting_1.setVariable(playerLocation, BC_CORRIDOR); }),
    scripting_1.addUserAction("Stay where you are.", function () {
    })
]));
scripting_1.addUserInteractionTree(blStateBT);
var mlStateBT = scripting_1.guard(function () { return scripting_1.getVariable(playerLocation) == ML_CORRIDOR; }, scripting_1.sequence([
    scripting_1.displayDescriptionAction("You move forward in the corridor."),
    scripting_1.addUserAction("Enter the storage room", function () { return scripting_1.setVariable(playerLocation, STORAGE); }),
    scripting_1.addUserAction("Move to the north in the corridor", function () { return scripting_1.setVariable(playerLocation, TL_CORRIDOR); }),
    scripting_1.addUserAction("Move to the south", function () { return scripting_1.setVariable(playerLocation, BL_CORRIDOR); }),
    scripting_1.addUserAction("Stay where you are.", function () {
    })
]));
scripting_1.addUserInteractionTree(mlStateBT);
var storageBT = scripting_1.guard(function () { return scripting_1.getVariable(playerLocation) == STORAGE; }, scripting_1.sequence([
    scripting_1.displayDescriptionAction("You enter the storage."),
    scripting_1.addUserAction("Exit the storage room", function () { return scripting_1.setVariable(playerLocation, ML_CORRIDOR); }),
    scripting_1.addUserAction("Stay where you are.", function () {
    })
]));
scripting_1.addUserInteractionTree(storageBT);
var commsBT = scripting_1.guard(function () { return scripting_1.getVariable(playerLocation) == COMMS; }, scripting_1.sequence([
    scripting_1.displayDescriptionAction("You enter the communications room."),
    scripting_1.addUserAction("Enter the cockpit", function () { return scripting_1.setVariable(playerLocation, COCKPIT); }),
    scripting_1.addUserAction("Exit the communications room into the corridor", function () { return scripting_1.setVariable(playerLocation, TL_CORRIDOR); }),
    scripting_1.addUserAction("Stay where you are.", function () {
    })
]));
scripting_1.addUserInteractionTree(commsBT);
var cockpitBT = scripting_1.guard(function () { return scripting_1.getVariable(playerLocation) == COCKPIT; }, scripting_1.sequence([
    scripting_1.displayDescriptionAction("You enter the cockpit."),
    scripting_1.addUserAction("Enter the engines room to the east", function () { return scripting_1.setVariable(playerLocation, ENGINES); }),
    scripting_1.addUserAction("Enter the communications room to the south", function () { return scripting_1.setVariable(playerLocation, COMMS); }),
    scripting_1.addUserAction("Stay where you are.", function () {
    })
]));
scripting_1.addUserInteractionTree(cockpitBT);
var enginesBT = scripting_1.guard(function () { return scripting_1.getVariable(playerLocation) == ENGINES; }, scripting_1.sequence([
    scripting_1.displayDescriptionAction("You enter the engines room."),
    scripting_1.addUserAction("Enter the cockpit to the east", function () { return scripting_1.setVariable(playerLocation, COCKPIT); }),
    scripting_1.addUserAction("Enter the corridor to the south", function () { return scripting_1.setVariable(playerLocation, TL_CORRIDOR); }),
    scripting_1.addUserAction("Stay where you are.", function () {
    })
]));
scripting_1.addUserInteractionTree(enginesBT);
var crewCard1BT = scripting_1.guard(function () { return scripting_1.getVariable(playerLocation) == scripting_1.getItemVariable(crewCard1, "currentLocation"); }, scripting_1.sequence([
    scripting_1.displayDescriptionAction("You notice a crew card lying around."),
    scripting_1.addUserActionTree("Pick up the crew card", scripting_1.sequence([
        scripting_1.action(function () { return true; }, function () {
            scripting_1.displayActionEffectText("You pick up the crew card.");
            scripting_1.setItemVariable(crewCard1, "currentLocation", "player");
            scripting_1.setVariable(crewCardsCollected, scripting_1.getVariable(crewCardsCollected) + 1);
        }, 0),
        scripting_1.action(function () { return true; }, function () {
            scripting_1.displayActionEffectText("Wow you know how to pick up things.");
        }, 0)
    ]))
]));
var crewCard2BT = scripting_1.guard(function () { return scripting_1.getVariable(playerLocation) == scripting_1.getItemVariable(crewCard2, "currentLocation"); }, scripting_1.sequence([
    scripting_1.displayDescriptionAction("You notice a crew card lying around."),
    scripting_1.addUserAction("Pick up the crew card", function () {
        scripting_1.displayActionEffectText("You pick up the crew card.");
        scripting_1.setItemVariable(crewCard2, "currentLocation", "player");
        scripting_1.setVariable(crewCardsCollected, scripting_1.getVariable(crewCardsCollected) + 1);
    })
]));
scripting_1.addUserInteractionTree(crewCard1BT);
scripting_1.addUserInteractionTree(crewCard2BT);
var alienNearby = scripting_1.guard(function () { return scripting_1.areAdjacent(scripting_1.getVariable(playerLocation), scripting_1.getAgentVariable(alien, "currentLocation")); }, scripting_1.displayDescriptionAction("You hear a thumping sound. The alien is nearby."));
scripting_1.addUserInteractionTree(alienNearby);
var gameOver = scripting_1.guard(function () { return scripting_1.getVariable(playerLocation) == "NA"; }, scripting_1.selector([
    scripting_1.guard(function () { return scripting_1.getVariable("endGame") == "win"; }, scripting_1.displayDescriptionAction("You have managed to escape!")),
    scripting_1.guard(function () { return scripting_1.getVariable("endGame") == "lose"; }, scripting_1.displayDescriptionAction("The creature grabs you before you can react! You struggle for a bit before realising it's all over.."))
]));
scripting_1.addUserInteractionTree(gameOver);
//Initialize sigma
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
exports.sigmaInstance = new sigma({
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
for (var locations in scripting_1.locationGraph) {
    exports.sigmaInstance.graph.addNode({
        // Main attributes:
        id: locations,
        label: locations,
        x: Math.random(),
        y: Math.random(),
        size: 17,
        color: '#000',
        borderColor: getRandomColor()
    });
}
for (var locations in scripting_1.locationGraph) {
    var adjacent = scripting_1.locationGraph[locations];
    for (var _i = 0, adjacent_1 = adjacent; _i < adjacent_1.length; _i++) {
        var adj = adjacent_1[_i];
        exports.sigmaInstance.graph.addEdge({
            id: 'e' + (edgeID++).toString(),
            source: locations,
            target: adj,
            size: 10
        });
    }
}
var dragListener = sigma.plugins.dragNodes(exports.sigmaInstance, exports.sigmaInstance.renderers[0]);
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
//4. Run the world
scripting_1.initialize();
var userInteractionObject = scripting_1.getUserInteractionObject();
//RENDERING-----
//var displayPanel = {x: 500, y: 0};
var textPanel = { x: 400, y: 425 };
var actionsPanel = { x: 420, y: 475 };
function render() {
    var alienLocation = scripting_1.getAgentVariable(alien, "currentLocation");
    var playerL = scripting_1.getVariable(playerLocation);
    for (var _i = 0, _a = exports.sigmaInstance.graph.nodes(); _i < _a.length; _i++) {
        var node = _a[_i];
        node.color = '#fff';
    }
    exports.sigmaInstance.graph.nodes(alienLocation).color = '#0f3e76';
    if (!util_1.isUndefined(exports.sigmaInstance.graph.nodes(playerL))) {
        exports.sigmaInstance.graph.nodes(playerL).color = '#f0f';
    }
    exports.sigmaInstance.refresh();
    var config = {
        nodeMargin: 20,
        gridSize: 5
    };
    //Configure the algorithm
    var listener = exports.sigmaInstance.configNoverlap(config);
    //Bind all events:
    listener.bind('start stop interpolate', function (event) {
        console.log(event.type);
    });
    //Start the algorithm:
    exports.sigmaInstance.startNoverlap();
    displayTextAndActions();
}
var canvas = document.getElementById('display');
var context = canvas.getContext('2d');
//
//  var spaceshipImage = new Image();
// spaceshipImage.onload = render;
// var playerImage = new Image();
// var alienImage = new Image();
//
// function render() {
//     context.clearRect(0, 0, canvas.width, canvas.height);
//     context.drawImage(spaceshipImage, displayPanel.x, displayPanel.y, 500, 300);
//     displayPlayer();
//     displayAlien();
//     displayTextAndActions();
// }
// var mapPositions = {
//     "START": {x: 230, y: 235},
//     "BC_CORRIDOR": {x: 240, y: 210},
//     "BR_CORRIDOR": {x: 300, y: 190},
//     "MR_CORRIDOR": {x: 305, y: 150},
//     "QUARTERS2": {x: 340, y: 155},
//     "QUARTERS1": {x: 340, y: 190},
//     "TR_CORRIDOR": {x: 300, y: 100},
//     "TC_CORRIDOR": {x: 230, y: 100},
//     "TL_CORRIDOR": {x: 170, y: 100},
//     "EXIT_ELEVATOR": {x: 230, y: 60},
//     "LAB": {x: 240, y: 170},
//     "ML_CORRIDOR": {x: 160, y: 150},
//     "BL_CORRIDOR": {x: 160, y: 200},
//     "ENGINES": {x: 170, y: 60},
//     "COCKPIT": {x: 120, y: 60},
//     "COMMS": {x: 120, y: 100},
//     "MEDICAL": {x: 250, y: 130},
//     "STORAGE": {x: 200, y: 150}
// };
//
// function displayPlayer() {
//     var currLocation = getVariable(playerLocation);
//     if (!isUndefined(mapPositions[currLocation]))
//         context.drawImage(playerImage, displayPanel.x + mapPositions[currLocation].x, displayPanel.y + mapPositions[currLocation].y, 16, 16);
// }
//
// function displayAlien() {
//     var currLocation = getAgentVariable(alien, "currentLocation");
//     context.drawImage(alienImage, displayPanel.x + mapPositions[currLocation].x, displayPanel.y + mapPositions[currLocation].y, 24, 24);
// }
//
//  spaceshipImage.src = "../images/isolation_map.png";
// playerImage.src = "../images/player2.png";
// alienImage.src = "../images/xenomorph.png";
var currentSelection;
var yOffset = actionsPanel.y + 25;
var yOffsetIncrement = 50;
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
        context.fillText("> ", 420, actionsPanel.y + 25 + (currentSelection * yOffsetIncrement));
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
