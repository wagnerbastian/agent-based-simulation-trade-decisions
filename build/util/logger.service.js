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
exports.Logger = void 0;
var fs = require("fs");
var data = __importStar(require("../parameters.json"));
var Logger = /** @class */ (function () {
    function Logger() {
    }
    Logger.prototype.log = function (data, title) {
        fs.writeFile(title, data, function () { });
    };
    Logger.prototype.logHistory = function (start, end, simulationResults) {
        if (!simulationResults || simulationResults.length === 0 || !simulationResults[0].history) {
            return;
        }
        var parameters = (data.default);
        var duration = (new Date(end).getTime() - new Date(start).getTime()) / 1000;
        var text = {
            start: start,
            end: end,
            duration: duration,
            agents: data.agents,
            iterations: data.runs,
            runs: data.repititions,
            strategy: data.decisionStrategy.decisionStrategy,
            pairingMethod: data.pairingMethod,
            results: simulationResults
        };
        try {
            fs.mkdirSync('logs');
        }
        catch (e) { }
        fs.writeFile("results.json", JSON.stringify(text), function () { });
        fs.writeFile("../masterarbeit-visualisierung/src/app/results.json", JSON.stringify(text), function () { });
        if (parameters.extendedLogging) {
            fs.writeFile("./logs/results-" + start.split(':').join('-') + ".json", JSON.stringify(text), function () { });
        }
    };
    Logger.prototype.logRun = function (start, end, results, populationInfo) {
        if (!populationInfo) {
            return;
        }
        var parameters = (data.default);
        var duration = (new Date(end).getTime() - new Date(start).getTime()) / 1000;
        var text = {
            start: start,
            end: end,
            duration: duration,
            agents: data.agents,
            iterations: data.runs,
            runs: data.repititions,
            strategy: data.decisionStrategy.decisionStrategy,
            pairingMethod: data.pairingMethod,
            populationInfo: populationInfo,
            results: results
        };
        try {
            fs.mkdirSync('logs');
        }
        catch (e) { }
        fs.writeFile("run.json", JSON.stringify(text), function () { });
        fs.writeFile("../masterarbeit-visualisierung/src/app/run.json", JSON.stringify(text), function () { });
        if (parameters.extendedLogging) {
            fs.writeFile("./logs/run-" + start.split(':').join('-') + ".json", JSON.stringify(text), function () { });
        }
    };
    Logger.prototype.logGraphInfo = function (agents) {
        var connections = [];
        agents.forEach(function (agent) {
            agent.node.neighbors.forEach(function (n) {
                connections.push({
                    a: agent.node.id,
                    b: n
                });
            });
        });
        var text = "";
        connections.forEach(function (connection) {
            text += connection.a + " " + connection.b + "\n";
        });
        fs.writeFile("graph.txt", text, function () { });
    };
    return Logger;
}());
exports.Logger = Logger;
