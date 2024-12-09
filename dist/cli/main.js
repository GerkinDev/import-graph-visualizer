#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var reporter_1 = require("./reporter");
var server_1 = require("./server");
(0, reporter_1.createReporterOutput)();
(0, server_1.runStaticServer)();
