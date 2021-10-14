"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphService = void 0;
var dijkstra_service_1 = require("./dijkstra.service");
var GraphService = /** @class */ (function () {
    function GraphService() {
        this.dijkstra = new dijkstra_service_1.DijkstraService();
        this.distances = [];
    }
    GraphService.prototype.generateGraphForDistance = function (agents) {
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
    GraphService.prototype.getdistanceBetweenAgents = function (from, to) {
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
    GraphService.prototype.calculateAllDistances = function (agents) {
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
    return GraphService;
}());
exports.GraphService = GraphService;
