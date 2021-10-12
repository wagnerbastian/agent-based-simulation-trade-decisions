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
exports.Analyzer = void 0;
var data = __importStar(require("../parameters.json"));
var Analyzer = /** @class */ (function () {
    function Analyzer(logger) {
        this.parameters = (data.default).analytics;
        this.logger = logger;
    }
    Analyzer.prototype.analyzePopulationInfo = function (historyIn) {
        if (!historyIn || historyIn.length === 0 || !historyIn[0].history) {
            return;
        }
        var history = JSON.parse(JSON.stringify(historyIn));
        var populationInfos = history[0].populationData;
        for (var index_1 = 1; index_1 < history.length - 1; index_1++) {
            populationInfos.wealthTotal += history[index_1].populationData.wealthTotal;
            populationInfos.maxWealthTotal += history[index_1].populationData.maxWealthTotal;
            populationInfos.minWealthTotal += history[index_1].populationData.minWealthTotal;
            populationInfos.maxIndividualWealth += history[index_1].populationData.maxIndividualWealth;
            populationInfos.minIndividualWealth += history[index_1].populationData.minIndividualWealth;
            populationInfos.maxIndividualWealthTotal += history[index_1].populationData.maxIndividualWealthTotal;
            populationInfos.minIndividualWealthTotal += history[index_1].populationData.minIndividualWealthTotal;
            populationInfos.maxPossibleIndividualWealth += history[index_1].populationData.maxPossibleIndividualWealth;
            populationInfos.minPossibleIndividualWealth += history[index_1].populationData.minPossibleIndividualWealth;
            populationInfos.maxIndividualWealth;
        }
        populationInfos.wealthTotal = populationInfos.wealthTotal / history.length;
        populationInfos.maxWealthTotal = populationInfos.maxWealthTotal / history.length;
        populationInfos.minWealthTotal = populationInfos.minWealthTotal / history.length;
        populationInfos.maxIndividualWealth = populationInfos.maxIndividualWealth / history.length;
        populationInfos.minIndividualWealth = populationInfos.minIndividualWealth / history.length;
        populationInfos.maxIndividualWealthTotal = populationInfos.maxIndividualWealthTotal / history.length;
        populationInfos.minIndividualWealthTotal = populationInfos.minIndividualWealthTotal / history.length;
        populationInfos.maxPossibleIndividualWealth = populationInfos.maxPossibleIndividualWealth / history.length;
        populationInfos.minPossibleIndividualWealth = populationInfos.minPossibleIndividualWealth / history.length;
        var wealthHistory = [];
        var _loop_1 = function (index_2) {
            var wealth = 0;
            history.forEach(function (h) {
                wealth += h.populationData.wealthTotalHistory[index_2];
            });
            wealth = wealth / history.length;
            wealthHistory.push(wealth);
        };
        for (var index_2 = 0; index_2 < history[0].populationData.wealthTotalHistory.length; index_2++) {
            _loop_1(index_2);
        }
        populationInfos.wealthTotalHistory = wealthHistory;
        var payoffHistory = history[0].populationData.totalPayoffHistory;
        var result = [];
        var index = 0;
        payoffHistory.forEach(function () {
            var val = 0;
            history.forEach(function (h) {
                val += h.populationData.totalPayoffHistory[index];
            });
            var res = val / history.length;
            result.push(res);
            index++;
        });
        populationInfos.totalPayoffHistory = result;
        return populationInfos;
    };
    Analyzer.prototype.analyzeResults = function (historyIn) {
        var _this = this;
        if (!historyIn || historyIn.length === 0 || !historyIn[0].history) {
            return;
        }
        var history = JSON.parse(JSON.stringify(historyIn));
        var result = [];
        history.forEach(function (his) {
            var index = (1 - _this.parameters.analyzePercentage) * his.history.length;
            var analyze = his.history.splice(index, his.history.length - index);
            var TC = 0;
            var UC = 0;
            var TP = 0;
            var UP = 0;
            analyze.forEach(function (el) {
                TC += el.TC;
                UC += el.UC;
                TP += el.TP;
                UP += el.UP;
            });
            TC = TC / analyze.length;
            UC = UC / analyze.length;
            TP = TP / analyze.length;
            UP = UP / analyze.length;
            result.push({ TC: TC, UC: UC, TP: TP, UP: UP });
        });
        var TC = 0;
        var UC = 0;
        var TP = 0;
        var UP = 0;
        result.forEach(function (el) {
            TC += el.TC;
            UC += el.UC;
            TP += el.TP;
            UP += el.UP;
        });
        TC = TC / result.length;
        UC = UC / result.length;
        TP = TP / result.length;
        UP = UP / result.length;
        return {
            TC: TC,
            UC: UC,
            TP: TP,
            UP: UP
        };
        // let index = (1 - this.parameters.analyzePercentage) * h.length;
        // const analyze = h.splice(0, index);
        // console.log("yyy");
    };
    return Analyzer;
}());
exports.Analyzer = Analyzer;
