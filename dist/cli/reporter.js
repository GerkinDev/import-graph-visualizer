"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReporterOutput = void 0;
var dependency_cruiser_1 = require("dependency-cruiser");
var fs_1 = __importDefault(require("fs"));
var ora_1 = __importDefault(require("ora"));
var path_1 = __importDefault(require("path"));
var typescript_1 = __importDefault(require("typescript"));
var yargs_1 = __importDefault(require("yargs"));
function createReporterOutput() {
    var _a;
    var args = yargs_1.default
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
    var entryPoints = args['entry-points'];
    var tsConfigFileName = args['ts-config'];
    var outputPath = args['output-path'];
    var extensions = (_a = args['extensions']) === null || _a === void 0 ? void 0 : _a.map(function (ext) { return ext.split(','); }).flat();
    console.dir({ entryPoints: entryPoints, tsConfigFileName: tsConfigFileName, outputPath: outputPath, extensions: extensions });
    var tsConfig = tsConfigFileName == null
        ? null
        : typescript_1.default.parseJsonConfigFileContent(typescript_1.default.readConfigFile(tsConfigFileName, typescript_1.default.sys.readFile)
            .config, typescript_1.default.sys, path_1.default.dirname(tsConfigFileName), {}, tsConfigFileName);
    var options = {
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
            extensions: extensions
        }
    };
    var cruiseSpinner = (0, ora_1.default)('Analyzing project imports').start();
    var output = (0, dependency_cruiser_1.cruise)(entryPoints, {
        ruleSet: {
            options: __assign(__assign({}, options), { tsConfig: { fileName: tsConfigFileName } }),
        },
    }, null, tsConfig).output;
    cruiseSpinner.succeed('Analyzed project imports');
    var fsSpinner = (0, ora_1.default)('Creating dependency graph').start();
    fs_1.default.writeFileSync(path_1.default.resolve(__dirname, 'reporter-output.json'), JSON.stringify(output));
    if (outputPath) {
        fs_1.default.copyFileSync(path_1.default.resolve(__dirname, 'reporter-output.json'), outputPath);
    }
    fsSpinner.succeed('Created dependency graph');
}
exports.createReporterOutput = createReporterOutput;
if (require.main === module) {
    createReporterOutput();
}
