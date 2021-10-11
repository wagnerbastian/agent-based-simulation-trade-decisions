import { Node } from "../service/network.service";
import { Strategy } from "./strategy";

export class Agent {
    index: number;
    wealth: number;
    strategy: Strategy;
    tradings: number;
    didTradeInThisStep: boolean;
    payoffs: number[];
    node: Node;
    communicationNode: Node;


    constructor(index: number) {
        this.index = index;
        this.wealth = 0;
        this.tradings = 0;
        this.didTradeInThisStep = false;
        this.payoffs = [];
    }
}

export interface AgentPair {
    a: Agent;
    b: Agent;
}