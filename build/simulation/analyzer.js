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
    Analyzer.prototype.analyzeResults = function (history) {
        var _this = this;
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
