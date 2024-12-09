"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runStaticServer = void 0;
var express_1 = __importDefault(require("express"));
var ora_1 = __importDefault(require("ora"));
var path_1 = __importDefault(require("path"));
var PORT = 4000;
var url = "http://localhost:".concat(PORT);
function runStaticServer() {
    var spinner = (0, ora_1.default)("Opening browser at ".concat(url)).start();
    var app = (0, express_1.default)();
    app.use(express_1.default.static(path_1.default.join(__dirname, '..', 'app')));
    app.use('/assets', express_1.default.static(path_1.default.join(__dirname, '..', 'cli')));
    app.listen(PORT, function () {
        // open(url).then(() => {
        spinner.succeed("Opened browser at ".concat(url));
        // });
    });
}
exports.runStaticServer = runStaticServer;
