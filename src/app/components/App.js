"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@material-ui/core");
const react_1 = __importStar(require("react"));
const filters_1 = require("../hooks/filters");
const parsers_1 = require("../utils/parsers");
const ControlPanel_1 = __importDefault(require("./ControlPanel"));
const DepGraph_1 = __importDefault(require("./DepGraph"));
const JSON_URL = process.env.NODE_ENV === 'production'
    ? '/assets/reporter-output.json'
    : '../../../dist/cli/reporter-output.json';
const App = () => {
    const [data, setData] = (0, react_1.useState)();
    const [physicsSimulation, setPhysicsSimulation] = (0, react_1.useState)(true);
    const moduleDeps = (0, react_1.useMemo)(() => data && (0, parsers_1.parseModuleDeps)(data), [data]);
    (0, react_1.useEffect)(() => {
        fetch(JSON_URL)
            .then(response => response.json())
            .then(json => {
            setData(json);
        });
    }, []);
    const [filters, setFilters] = (0, filters_1.useFilters)();
    if (moduleDeps == null) {
        return react_1.default.createElement(core_1.LinearProgress, null);
    }
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(ControlPanel_1.default, { moduleDeps: moduleDeps, filters: filters, onSubmit: setFilters, physicsSimulation: physicsSimulation, setPhysicsSimulation: setPhysicsSimulation }),
        react_1.default.createElement(DepGraph_1.default, { moduleDeps: moduleDeps, filters: filters, physicsSimulation: physicsSimulation })));
};
exports.default = App;
//# sourceMappingURL=App.js.map