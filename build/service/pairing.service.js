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
exports.PairingService = void 0;
var data = __importStar(require("../parameters.json"));
var PairingService = /** @class */ (function () {
    function PairingService() {
        this.parameters = data.default;
    }
    // wählt 2 zufällige Agenten aus, die noch nicht gehandelt haben
    PairingService.prototype.simplePairAgents = function (agents) {
        var availableAgents = agents.filter(function (agent) { return !agent.didTradeInThisStep; });
        if (availableAgents.length > 1) {
            // einen zufälligen Agenten auswählen
            var a = availableAgents[Math.floor(Math.random() * availableAgents.length)];
            // gewählten Agenten aus dem Array entfernen
            var elIndex = availableAgents.indexOf(a);
            availableAgents.splice(elIndex, 1);
            // Agenten aus den restlichen auswählen
            var b = availableAgents[Math.floor(Math.random() * availableAgents.length)];
            // zwei Agenten zurückgeben
            return {
                a: a,
                b: b
            };
        }
        else {
            // objekt mit null agenten zurückgeben
            return {
                a: null,
                b: null
            };
        }
    };
    /**
     *
     * @param agents agenten
     * @returns Agentenpaar oder Paar aus null
     */
    PairingService.prototype.networkPairAgentsForTrade = function (agents, onlyTradeable) {
        for (var index = 0; index < agents.length; index++) {
            // Agenten der noch nicht gehandelt hat suchen
            if (!agents[index].didTradeInThisStep) {
                var a = agents[index];
                var b = null;
                // suche Partner aus den nachbarn
                try {
                    b = this.searchTradePartner(a, onlyTradeable, agents);
                }
                catch (e) {
                }
                return { a: a, b: b };
            }
        }
        // alle Agenten haben gehandelt
        return { a: null, b: null };
    };
    PairingService.prototype.getMinDijkstraDistance = function (edgeWeight, currentDistance) {
        if (currentDistance === void 0) { currentDistance = 0; }
        currentDistance++;
        if (Math.random() > edgeWeight) {
            return this.getMinDijkstraDistance(edgeWeight, currentDistance);
        }
        return currentDistance;
    };
    PairingService.prototype.dijkstraPair = function (agents) {
        for (var index = 0; index < agents.length; index++) {
            // Agenten der noch nicht gehandelt hat suchen
            if (!agents[index].didTradeInThisStep) {
                var a = agents[index];
                var b = null;
                // suche Partner aus den nachbarn
                try {
                    b = this.searchTradePartnerDijkstra(a, agents);
                }
                catch (e) {
                }
                return { a: a, b: b };
            }
        }
        // alle Agenten haben gehandelt
        return { a: null, b: null };
    };
    PairingService.prototype.searchTradePartnerDijkstra = function (agent, agents) {
        var _this = this;
        var possibleAgents = agents.filter(function (a) { return !a.didTradeInThisStep && a.index !== agent.index; });
        var distances = [];
        var distance = this.getMinDijkstraDistance(this.parameters.edgeWeight);
        possibleAgents.forEach(function (a) {
            var distance = _this.networkService.getdistanceBetweenAgents(agent, a);
            distances.push({ agent: a, distance: distance });
        });
        var partner = null;
        for (var index = distance; index >= 0; index--) {
            for (var i = 0; i < distances.length; i++) {
                if (distances[i].distance === index && partner == null) {
                    partner = distances[i];
                }
            }
        }
        return partner.agent;
    };
    PairingService.prototype.searchTradePartner = function (agent, onlyTradeable, agents) {
        // Wenn der Wert höher als das Kantengewicht ist, geht der Agent eins weiter, sonst handelt er mit seinem Nachbarn.
        var moves = Math.random() > this.parameters.edgeWeight;
        // zufälligen Nachbarn aussuchen mit dem gehandelt oder weiter gegangen wird
        if (onlyTradeable) {
            return this.getTradableNeighbor(agent.node.id, agent.node.neighbors, agent.strategy.name, onlyTradeable, agents);
        }
        if (!moves) {
            var partner = this.getTradableNeighbor(agent.node.id, agent.node.neighbors, agent.strategy.name, onlyTradeable, agents);
            // Wenn mit einem Partner gehandelt werden kann, wird dieser zurückgegeben.
            if (partner != null) {
                return partner;
            }
            else {
                // Alle Nachbarn haben gehandelt
                // zu zufälligen Nachbarn laufen und dort suchen
                var neighborIndex = Math.floor(Math.random() * agent.node.neighbors.length);
                var neighbor = this.networkService.getAgentFromNodeID(agent.node.neighbors[neighborIndex]);
                return this.searchTradePartner(neighbor, onlyTradeable, agents);
            }
        }
        else {
            // zu zufälligen Nachbarn laufen und dort suchen
            var neighborIndex = Math.floor(Math.random() * agent.node.neighbors.length);
            var neighbor = this.networkService.getAgentFromNodeID(agent.node.neighbors[neighborIndex]);
            return this.searchTradePartner(neighbor, onlyTradeable, agents);
        }
    };
    /**
     * gibt einen Nachbaragenten zurück, falls einer frei ist
     * @param neighbors IDs der Nachbar Nodes
     * @returns Agent wenn einer da ist mit dem gehandelt werden kann. Null, wenn mit allen gehandelt wurde
     */
    PairingService.prototype.getTradableNeighbor = function (agentNodeID, neighbors, agentStrategyName, onlyTradeable, agents) {
        var _this = this;
        if (!onlyTradeable) {
            // Nach Nachbarn suchen die noch nicht gehandelt haben
            var possibleNeighbors_1 = [];
            neighbors.forEach(function (n) {
                var a = _this.networkService.getAgentFromNodeID(n);
                if (!a.didTradeInThisStep) {
                    possibleNeighbors_1.push(a);
                }
            });
            if (possibleNeighbors_1.length > 0) {
                // es ist ein Nachbar da der handeln kann
                // zufälligen Nachbarn zurückgeben.
                var index = Math.floor(Math.random() * possibleNeighbors_1.length);
                return possibleNeighbors_1[index];
            }
            return null;
        }
        else {
            // nur partner suchen mit denen gehandelt werden kann...
            var possibleTradePartners = agents.filter(function (agent) { return agent.node.id !== agentNodeID && !agent.didTradeInThisStep && _this.canTradeWith(agentStrategyName, agent.strategy.name); });
            var distances_1 = [];
            possibleTradePartners.forEach(function (p) {
                var agent = _this.networkService.getAgentFromNodeID(agentNodeID);
                var distance = _this.networkService.getdistanceBetweenAgents(agent, p);
                distances_1.push({ distance: distance, agent: p });
            });
            var partner_1 = distances_1[0];
            distances_1.forEach(function (element) {
                if (element.distance < partner_1.distance) {
                    partner_1 = element;
                }
            });
            return partner_1.agent;
        }
    };
    // gibt true zurück wenn einer ein Consumer und der andere ein Provider ist
    PairingService.prototype.canTradeWith = function (agentAStrategyName, agentBStrategyName) {
        return (agentAStrategyName.includes('P') && agentBStrategyName.includes('C') || agentAStrategyName.includes('C') && agentBStrategyName.includes('P'));
    };
    return PairingService;
}());
exports.PairingService = PairingService;
