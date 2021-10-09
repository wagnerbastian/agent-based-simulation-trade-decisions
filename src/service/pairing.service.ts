import {
    Agent,
    AgentPair
} from "../model/agent";

export class PairingService {


    // wählt 2 zufällige Agenten aus, die noch nicht gehandelt haben
    simplePairAgents(agents: Agent[]): AgentPair {
        const availableAgents = agents.filter(agent => !agent.didTradeInThisStep);
        if (availableAgents.length > 1) {

            // einen zufälligen Agenten auswählen
            const a = availableAgents[Math.floor(Math.random() * availableAgents.length)];

            // gewählten Agenten aus dem Array entfernen
            const elIndex = availableAgents.indexOf(a);
            availableAgents.splice(elIndex, 1);

            // Agenten aus den restlichen auswählen
            const b = availableAgents[Math.floor(Math.random() * availableAgents.length)];

            // zwei Agenten zurückgeben
            return {
                a,
                b
            };

        } else {
            // objekt mit null agenten zurückgeben
            return {
                a: null,
                b: null
            };
        }
    }

}