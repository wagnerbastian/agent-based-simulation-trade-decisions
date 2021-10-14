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
        this.graphService.generateGraphForDistance(agents);
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
