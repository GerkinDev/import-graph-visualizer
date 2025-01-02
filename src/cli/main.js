#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const reporter_1 = require("./reporter");
const server_1 = require("./server");
(0, reporter_1.createReporterOutput)().then(() => {
    (0, server_1.runStaticServer)();
});
//# sourceMappingURL=main.js.map