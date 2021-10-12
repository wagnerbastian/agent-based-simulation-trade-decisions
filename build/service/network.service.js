"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Node = exports.NetworkService = void 0;
var data = __importStar(require("../parameters.json"));
var dijkstra_service_1 = require("./dijkstra.service");
var NetworkService = /** @class */ (function () {
    function NetworkService() {
        this.parameters = data.default;
        this.nodes = [];
        this.communicationNodes = [];
        this.distances = [];
        this.dijkstra = new dijkstra_service_1.DijkstraService();
    }
    /**
     * Erstellt für jeden Agenten einen Node und vergibt Nachbarn
     * @param agents agenten
     */
    NetworkService.prototype.createNetwork = function (agents) {
        var _this = this;
        this.agents = agents;
        // jedem Agenten einen Node erstellen
        var index = 0;
        agents.forEach(function (agent) {
            agent.node = new Node(index);
            agent.node.agent = agent.index;
            _this.nodes.push(agent.node);
            index++;
        });
        agents.forEach(function (agent) {
            _this.setupNeighbors(agent, agents);
        });
        this.generateGraphForDistance(agents);
        this.calculateAllDistances(agents);
        console.log(this.dijkstra.findShortestPath(this.graph, 1, 8));
    };
    /**
     * Kommunaikationsnetzwerk wird erstellt und Nachbarn zugewiesen
     */
    NetworkService.prototype.createCommunicationNetwork = function (agents) {
        var _this = this;
        // jedem Agenten einen Node erstellen
        var index = 0;
        agents.forEach(function (agent) {
            agent.communicationNode = new Node(index);
            agent.communicationNode.agent = agent.index;
            _this.communicationNodes.push(agent.node);
            index++;
        });
        agents.forEach(function (agent) {
            _this.setupCommunicationNeighbors(agent, agents);
        });
    };
    /**
     * Nachbarn für die Kommunikation werden vergeben.
     */
    NetworkService.prototype.setupCommunicationNeighbors = function (agent, agents) {
        var _this = this;
        if (agent.communicationNode.neighbors.length === 0) {
            // neuer Agent ohne Nachbarn
            // Anzahl Nachbarn wird zufällig generiert
            var neighbors = Math.round(Math.random() * this.parameters.maxCommunicationNeighbors + 0.5);
            // zufällige Anzahl an Nachbarn vergeben
            for (var index = 0; index < neighbors; index++) {
                // filtern nach Agenten die noch nicht "voll" sind und diesen Agenten noch nicht als Nachbar haben
                var possibleNeighbors = agents.filter(function (a) { return a.index != agent.index && agent.communicationNode.neighbors.length < _this.parameters.maxNeighbors && !agent.communicationNode.neighbors.includes(a.node.id); });
                if (possibleNeighbors.length > 0) {
                    var neighbor = possibleNeighbors[Math.floor(Math.random() * possibleNeighbors.length)];
                    neighbor.communicationNode.neighbors.push(agent.communicationNode.id);
                    agent.communicationNode.neighbors.push(neighbor.communicationNode.id);
                }
            }
        }
    };
    NetworkService.prototype.setupNeighbors = function (agent, agents) {
        var _this = this;
        if (agent.node.neighbors.length === 0) {
            // neuer Agent ohne Nachbarn
            // Anzahl Nachbarn wird zufällig generiert
            var neighbors = Math.round(Math.random() * this.parameters.maxNeighbors + 0.5);
            // zufällige Anzahl an Nachbarn vergeben
            for (var index = 0; index < neighbors; index++) {
                // filtern nach Agenten die noch nicht "voll" sind und diesen Agenten noch nicht als Nachbar haben
                var possibleNeighbors = agents.filter(function (a) { return a.index != agent.index && agent.node.neighbors.length < _this.parameters.maxNeighbors && !agent.node.neighbors.includes(a.node.id); });
                if (possibleNeighbors.length > 0) {
                    var neighbor = possibleNeighbors[Math.floor(Math.random() * possibleNeighbors.length)];
                    neighbor.node.neighbors.push(agent.node.id);
                    agent.node.neighbors.push(neighbor.node.id);
                }
            }
        }
        else if (agent.node.neighbors.length < this.parameters.minNeighbors) {
            // Anzahl Nachbarn wird zufällig generiert
            var neighbors = Math.round(Math.random() * this.parameters.maxNeighbors + 0.5) - agent.node.neighbors.length;
            if (neighbors > 0) {
                // zufällige Anzahl an Nachbarn vergeben
                for (var index = 0; index < neighbors; index++) {
                    // filtern nach Agenten die noch nicht "voll" sind und diesen Agenten noch nicht als Nachbar haben
                    var possibleNeighbors = agents.filter(function (a) { return a.index != agent.index && agent.node.neighbors.length < _this.parameters.maxNeighbors && !agent.node.neighbors.includes(a.node.id); });
                    if (possibleNeighbors.length > 0) {
                        var neighbor = possibleNeighbors[Math.floor(Math.random() * possibleNeighbors.length)];
                        neighbor.node.neighbors.push(agent.node.id);
                        agent.node.neighbors.push(neighbor.node.id);
                    }
                }
            }
        }
    };
    NetworkService.prototype.getNodeFromAgent = function (agent) {
        var result = this.nodes.find(function (n) { return n.agent === agent.index; });
        return result;
    };
    NetworkService.prototype.getAgentFromNode = function (node) {
        var result = this.agents.find(function (a) { return a.node.id === node.id; });
        return result;
    };
    NetworkService.prototype.getAgentFromNodeID = function (nodeID) {
        var result = this.agents.find(function (a) { return a.node.id === nodeID; });
        return result;
    };
    NetworkService.prototype.generateGraphForDistance = function (agents) {
        console.log("- starting graph building");
        var graph = {};
        // A: { start: 1, C: 1, D: 1 },
        agents.forEach(function (agent) {
            var node = {};
            agent.node.neighbors.forEach(function (n) {
                node[n] = 1;
            });
            graph[agent.node.id] = node;
        });
        this.graph = graph;
        console.log("- finished graph building");
    };
    NetworkService.prototype.calculateAllDistances = function (agents) {
        var _this = this;
        return;
        var start = new Date();
        console.log("-- Calculating all Distances");
        agents.forEach(function (agent) {
            process.stdout.write(".");
            agents.forEach(function (destination) {
                if (agent.index !== destination.index) {
                    var exists = _this.distances.find(function (dis) {
                        return (dis.from + '' === agent.node.id + '' || dis.to + '' === agent.node.id + '') &&
                            (dis.from + '' === destination.node.id + '' || dis.to + '' === destination.node.id + '');
                    }) != null;
                    if (!exists) {
                        // console.log(agent.node.id, destination.node.id);
                        var path = _this.dijkstra.findShortestPath(_this.graph, agent.node.id, destination.node.id);
                        _this.distances.push({ from: agent.node.id, to: destination.node.id, distance: path.path.length });
                        _this.distances.push({ from: destination.node.id, to: agent.node.id, distance: path.path.length });
                        if (path.path.length > 2 && false) {
                            var _loop_1 = function (index) {
                                var from = agent.node.id;
                                var to = Number(path.path[index]);
                                var exists_1 = _this.distances.find(function (dis) {
                                    return (dis.from + '' === from + '' || dis.to + '' === from + '') &&
                                        (dis.from + '' === to + '' || dis.to + '' === to + '');
                                }) != null;
                                if (!exists_1) {
                                    _this.distances.push({ from: from, to: to, distance: index });
                                    _this.distances.push({ to: from, from: to, distance: index });
                                }
                            };
                            for (var index = 1; index < path.path.length - 1; index++) {
                                _loop_1(index);
                            }
                        }
                    }
                }
            });
        });
        var end = new Date();
        console.log(this.distances.length);
        console.log("\n-- Finished calculating all Distances, Duration in s:", (end.getTime() - start.getTime()) / 1000);
    };
    NetworkService.prototype.getdistanceBetweenAgents = function (from, to) {
        var distance = this.distances.find(function (dis) {
            return dis.from + '' === from.node.id + '' && dis.to + '' === to.node.id + '';
        });
        if (distance) {
            return distance.distance;
        }
        var path = this.dijkstra.findShortestPath(this.graph, from.node.id, to.node.id);
        this.distances.push({ from: from.node.id, to: to.node.id, distance: path.distance });
        return path.distance;
    };
    return NetworkService;
}());
exports.NetworkService = NetworkService;
var Node = /** @class */ (function () {
    function Node(id) {
        this.neighbors = [];
        this.paths = [];
        this.id = id;
    }
    Node.prototype.getAgent = function () {
        return this.agent;
    };
    Node.prototype.getNeighbors = function () {
        return this.neighbors;
    };
    return Node;
}());
exports.Node = Node;
