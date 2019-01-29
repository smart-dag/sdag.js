"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:no-expression-statement
var ava_1 = __importDefault(require("ava"));
var number_1 = require("./number");
ava_1.default('double', function (t) {
    t.is(number_1.double(2), 4);
});
ava_1.default('power', function (t) {
    t.is(number_1.power(2, 4), 16);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVyLnNwZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL251bWJlci5zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEseUNBQXlDO0FBQ3pDLDRDQUF1QjtBQUN2QixtQ0FBeUM7QUFFekMsYUFBSSxDQUFDLFFBQVEsRUFBRSxVQUFBLENBQUM7SUFDZCxDQUFDLENBQUMsRUFBRSxDQUFDLGVBQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNyQixDQUFDLENBQUMsQ0FBQztBQUVILGFBQUksQ0FBQyxPQUFPLEVBQUUsVUFBQSxDQUFDO0lBQ2IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxjQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3hCLENBQUMsQ0FBQyxDQUFDIn0=