"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payoff = exports.Trade = void 0;
var Trade = /** @class */ (function () {
    function Trade(r, temp, s, x) {
        this.payoffs = new Payoff(r, temp, s, x);
        this.maxPayoff = Math.max(r, temp, s, x);
        this.minPayoff = Math.min(r, temp, s, x, -s, -x);
    }
    Trade.prototype.performTrade = function (a, b) {
        // payoff der beiden Agenten ermitteln
        var payoffA = this.payoffs.getPayoff(a, b);
        var payoffB = this.payoffs.getPayoff(b, a);
        // payoff anwenden
        a.wealth += payoffA;
        b.wealth += payoffB;
        // als gehandelt markieren und anzahl der Trades hochzählen
        a.didTradeInThisStep = true;
        b.didTradeInThisStep = true;
        a.tradings++;
        b.tradings++;
        a.payoffs.push(payoffA);
        b.payoffs.push(payoffB);
        // Payoff objekt zurückgeben um damit arbeiten zu können (Strategiewechsel)
        if (payoffA < 0 && payoffA * -1 > payoffB) {
            console.log(payoffA, payoffB);
        }
        if (payoffB < 0 && payoffB * -1 > payoffA) {
            console.log(payoffA, payoffB);
        }
        return { payoffA: payoffA, payoffB: payoffB };
    };
    return Trade;
}());
exports.Trade = Trade;
var Payoff = /** @class */ (function () {
    function Payoff(r, temp, s, x) {
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
        };
    }
    Payoff.prototype.getPayoff = function (a, b) {
        if (a.strategy.name === 'TP') {
            if (b.strategy.name === 'TC') {
                return this.payoffs.TP.TC;
            }
            else if (b.strategy.name === 'UC') {
                return this.payoffs.TP.UC;
            }
            else {
                return 0;
            }
        }
        else if (a.strategy.name === 'UP') {
            if (b.strategy.name === 'TC') {
                return this.payoffs.UP.TC;
            }
            else if (b.strategy.name === 'UC') {
                return this.payoffs.UP.UC;
            }
            else {
                return 0;
            }
        }
        else if (a.strategy.name === 'TC') {
            if (b.strategy.name === 'TP') {
                return this.payoffs.TC.TP;
            }
            else if (b.strategy.name === 'UP') {
                return this.payoffs.TC.UP;
            }
            else {
                return 0;
            }
        }
        else if (a.strategy.name === 'UC') {
            if (b.strategy.name === 'TP') {
                return this.payoffs.UC.TP;
            }
            else if (b.strategy.name === 'UP') {
                return this.payoffs.UC.UP;
            }
            else {
                return 0;
            }
        }
        console.log("failed");
        return 0;
    };
    return Payoff;
}());
exports.Payoff = Payoff;
// R= 21, Temp = 40, S = 20, x = 10
