"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimulationService = void 0;
var agent_1 = require("../model/agent");
var SimulationService = /** @class */ (function () {
    function SimulationService() {
    }
    SimulationService.prototype.initAgents = function (numberOfAgents, strategies) {
        var agents = [];
        for (var index = 0; index < numberOfAgents; index++) {
            var a = new agent_1.Agent(index);
            if (numberOfAgents * strategies[0].distribution > index) {
                a.strategy = strategies[0];
            }
            else if (numberOfAgents * strategies[1].distribution > index) {
                a.strategy = strategies[1];
            }
            else if (numberOfAgents * strategies[2].distribution > index) {
                a.strategy = strategies[2];
            }
            else if (numberOfAgents * strategies[3].distribution > index) {
                a.strategy = strategies[3];
            }
            agents.push(a);
        }
        return agents;
    };
    SimulationService.prototype.countStrategies = function (agents) {
        var result = {
            TC: 0,
            UC: 0,
            TP: 0,
            UP: 0
        };
        agents.forEach(function (agent) {
            switch (agent.strategy.name) {
                case 'TC': {
                    result.TC++;
                    break;
                }
                case 'UC': {
                    result.UC++;
                    break;
                }
                case 'TP': {
                    result.TP++;
                    break;
                }
                case 'UP': {
                    result.UP++;
                    break;
                }
            }
        });
        return result;
    };
    return SimulationService;
}());
exports.SimulationService = SimulationService;
