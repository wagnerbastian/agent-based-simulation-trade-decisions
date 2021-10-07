import { Agent } from "./agent";

export interface TradePayoff {
    payoffA: number;
    payoffB: number;
}

export class Trade {
    payoffs;
    maxPayoff: number;
    minPayoff: number;

    constructor(r: number, temp: number, s: number, x: number) {
        this.payoffs = new Payoff(r, temp, s, x);

        this.maxPayoff = Math.max(r, temp, s, x);
        this.minPayoff = Math.min(r, temp, s, x, -s, -x);
    }

    performTrade(a: Agent, b: Agent): TradePayoff {
        // payoff der beiden Agenten ermitteln
        const payoffA = this.payoffs.getPayoff(a, b);
        const payoffB = this.payoffs.getPayoff(b, a)

        // payoff anwenden
        a.wealth += payoffA;
        b.wealth += payoffB;

        // als gehandelt markieren und anzahl der Trades hochzählen
        a.didTradeInThisStep = true;
        b.didTradeInThisStep = true;
        a.tradings++;
        b.tradings ++;

        a.payoffs.push(payoffA);
        b.payoffs.push(payoffB);

        // Payoff objekt zurückgeben um damit arbeiten zu können (Strategiewechsel)
        return {payoffA, payoffB};
    }
}

export class Payoff {
    payoffs: any;
    constructor(r: number, temp: number, s: number, x: number) {
        this.payoffs = {
            TP: {
                TC: r,
                UC: -s,
                TP: 0,
                UP: 0
            },
            UP: {
                TC: x,
                UC: x,
                UP: 0,
                TP: 0
            },
            TC: {
                TP: r,
                UP: -x,
                TC: 0,
                UC: 0
            },
            UC: {
                TP: temp,
                UP: -x,
                UC: 0,
                TC: 0
            }
        }
    }

    getPayoff(a: Agent, b: Agent): number {
        if (a.strategy.name === 'TP') {
            if (b.strategy.name === 'TC') {
                return this.payoffs.TP.TC;
            } else if (b.strategy.name === 'UC') {
                return this.payoffs.TP.UC;
            } else {
                return 0;
            }
        } else if (a.strategy.name === 'UP') {
            if (b.strategy.name === 'TC') {
                return this.payoffs.UP.TC;
            } else if (b.strategy.name === 'UC') {
                return this.payoffs.UP.UC;
            } else {
                return 0;
            }
        } else if (a.strategy.name === 'TC') {
            if (b.strategy.name === 'TP') {
                return this.payoffs.TC.TP;
            } else if (b.strategy.name === 'UP') {
                return this.payoffs.TC.UP;
            } else {
                return 0;
            }
        } else if (a.strategy.name === 'UC') {
            if (b.strategy.name === 'TP') {
                return this.payoffs.UC.TP;
            } else if (b.strategy.name === 'UP') {
                return this.payoffs.UC.UP;
            } else {
                return 0;
            }
        }
        console.log("failed");
        return 0;
        
    }
}

// R= 21, Temp = 40, S = 20, x = 10