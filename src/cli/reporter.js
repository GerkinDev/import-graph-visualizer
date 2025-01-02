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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReporterOutput = void 0;
const fs_1 = __importDefault(require("fs"));
const ora_1 = __importDefault(require("ora"));
const path_1 = __importDefault(require("path"));
const typescript_1 = __importDefault(require("typescript"));
const yargs_1 = __importDefault(require("yargs"));
function createReporterOutput() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const { cruise } = yield Promise.resolve().then(() => __importStar(require('dependency-cruiser')));
        const args = yargs_1.default
            .option('entry-points', {
            alias: 'e',
            demandOption: true,
            array: true,
            string: true,
        })
            .option('ts-config', {
            alias: 't',
            demandOption: false,
            string: true,
        })
            .option('output-path', {
            alias: 'o',
            demandOption: false,
            string: true,
        })
            .option('extensions', {
            demandOption: false,
            string: true,
            array: true
        }).argv;
        const entryPoints = args['entry-points'];
        const tsConfigFileName = args['ts-config'];
        const outputPath = args['output-path'];
        const extensions = (_a = args['extensions']) === null || _a === void 0 ? void 0 : _a.map((ext) => ext.split(',')).flat();
        console.dir({ entryPoints, tsConfigFileName, outputPath, extensions });
        const tsConfig = tsConfigFileName == null
            ? null
            : typescript_1.default.parseJsonConfigFileContent(typescript_1.default.readConfigFile(tsConfigFileName, typescript_1.default.sys.readFile)
                .config, typescript_1.default.sys, path_1.default.dirname(tsConfigFileName), {}, tsConfigFileName);
        const cruiseSpinner = (0, ora_1.default)('Analyzing project imports').start();
        const { output } = yield cruise(entryPoints, {
            doNotFollow: {
                path: 'node_modules',
                dependencyTypes: [
                    'npm',
                    'npm-dev',
                    'npm-optional',
                    'npm-peer',
                    'npm-bundled',
                    'npm-no-pkg',
                ],
            },
            tsPreCompilationDeps: true,
            enhancedResolveOptions: {
                extensions
            },
        }, undefined, { tsConfig });
        cruiseSpinner.succeed('Analyzed project imports');
        const fsSpinner = (0, ora_1.default)('Creating dependency graph').start();
        fs_1.default.writeFileSync(path_1.default.resolve(__dirname, 'reporter-output.json'), JSON.stringify(output));
        if (outputPath) {
            fs_1.default.copyFileSync(path_1.default.resolve(__dirname, 'reporter-output.json'), outputPath);
        }
        fsSpinner.succeed('Created dependency graph');
    });
}
exports.createReporterOutput = createReporterOutput;
if (require.main === module) {
    createReporterOutput();
}
//# sourceMappingURL=reporter.js.map