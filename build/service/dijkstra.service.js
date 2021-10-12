"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DijkstraService = void 0;
var DijkstraService = /** @class */ (function () {
    function DijkstraService() {
        var _this = this;
        this.findShortestPath = function (graph, startNode, endNode) {
            // establish object for recording distances from the start node
            var distances = {};
            distances[endNode] = "Infinity";
            distances = Object.assign(distances, graph[startNode]);
            // track paths
            var parents = { endNode: null };
            for (var child in graph[startNode]) {
                parents[child] = startNode;
            }
            // track nodes that have already been visited
            var visited = [];
            // find the nearest node
            var node = _this.shortestDistanceNode(distances, visited);
            // for that node
            while (node) {
                // find its distance from the start node & its child nodes
                var distance = distances[node];
                var children = graph[node];
                // for each of those child nodes
                for (var child in children) {
                    // make sure each child node is not the start node
                    if (String(child) === String(startNode)) {
                        continue;
                    }
                    else {
                        // save the distance from the start node to the child node
                        var newdistance = distance + children[child];
                        // if there's no recorded distance from the start node to the child node in the distances object
                        // or if the recorded distance is shorter than the previously stored distance from the start node to the child node
                        // save the distance to the object
                        // record the path
                        if (!distances[child] || distances[child] > newdistance) {
                            distances[child] = newdistance;
                            parents[child] = node;
                        }
                    }
                }
                // move the node to the visited set
                visited.push(node);
                // move to the nearest neighbor node
                node = _this.shortestDistanceNode(distances, visited);
            }
            // using the stored paths from start node to end node
            // record the shortest path
            var shortestPath = [endNode];
            var parent = parents[endNode];
            while (parent) {
                shortestPath.push(parent);
                parent = parents[parent];
            }
            shortestPath.reverse();
            // return the shortest path from start node to end node & its distance
            var results = {
                distance: distances[endNode],
                path: shortestPath,
            };
            return results;
        };
        this.shortestDistanceNode = function (distances, visited) {
            var shortest = null;
            for (var node in distances) {
                var currentIsShortest = shortest === null || distances[node] < distances[shortest];
                if (currentIsShortest && !visited.includes(node)) {
                    shortest = node;
                }
            }
            return shortest;
        };
    }
    return DijkstraService;
}());
exports.DijkstraService = DijkstraService;
