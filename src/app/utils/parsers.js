"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseModuleDeps = void 0;
function parseModuleDeps(result) {
    var _a;
    const localModules = new Set();
    const nodeBuiltInModules = new Set();
    const aliases = new Map();
    const npmPackageNames = new Map();
    const sourceDeps = new Map();
    const sourceImportedBy = new Map();
    (_a = result.summary.optionsUsed.args) === null || _a === void 0 ? void 0 : _a.split(/\s+/).forEach(entryPoint => {
        localModules.add(entryPoint);
    });
    result.modules.forEach(module => {
        module.dependencies.forEach(dependency => {
            var _a, _b;
            sourceDeps.set(module.source, [
                ...((_a = sourceDeps.get(module.source)) !== null && _a !== void 0 ? _a : []),
                { source: dependency.resolved, isDynamic: dependency.dynamic },
            ]);
            sourceImportedBy.set(dependency.resolved, [
                ...((_b = sourceImportedBy.get(dependency.resolved)) !== null && _b !== void 0 ? _b : []),
                { source: module.source, isDynamic: dependency.dynamic },
            ]);
            if (dependency.dependencyTypes.includes('local')) {
                localModules.add(dependency.resolved);
            }
            if (dependency.dependencyTypes.includes('core')) {
                nodeBuiltInModules.add(dependency.resolved);
            }
            if (dependency.dependencyTypes.includes('aliased')) {
                aliases.set(dependency.resolved, dependency.module);
                localModules.add(dependency.resolved);
            }
            else if (dependency.dependencyTypes.some(type => type.startsWith('npm'))) {
                npmPackageNames.set(dependency.resolved, dependency.module);
            }
        });
    });
    const allModules = result.modules
        .map((module) => {
        const npmPackageName = npmPackageNames.get(module.source);
        const alias = aliases.get(module.source);
        const isLocal = localModules.has(module.source);
        const isNodeBuiltIn = nodeBuiltInModules.has(module.source);
        return Object.assign({ path: npmPackageName !== null && npmPackageName !== void 0 ? npmPackageName : module.source, source: module.source, isLocal,
            isNodeBuiltIn }, (alias && { alias }));
    })
        .filter((item, index, array) => array.findIndex(({ path }) => path === item.path) === index)
        .sort((a, b) => a.path.localeCompare(b.path));
    const { moduleBySource, moduleByPath } = allModules.reduce((acc, module) => ({
        moduleBySource: Object.assign(Object.assign({}, acc.moduleBySource), { [module.source]: module }),
        moduleByPath: Object.assign(Object.assign({}, acc.moduleByPath), { [module.path]: module }),
    }), { moduleBySource: {}, moduleByPath: {} });
    const pathDeps = {};
    sourceDeps.forEach((value, key) => {
        pathDeps[moduleBySource[key].path] = value.map(({ source, isDynamic }) => ({
            path: moduleBySource[source].path,
            isDynamic,
        }));
    });
    const pathImportedBy = {};
    sourceImportedBy.forEach((value, key) => {
        pathImportedBy[moduleBySource[key].path] = value.map(({ source, isDynamic }) => ({
            path: moduleBySource[source].path,
            isDynamic,
        }));
    });
    return {
        modules: moduleByPath,
        paths: allModules.map(({ path }) => path),
        deps: pathDeps,
        importedBy: pathImportedBy,
    };
}
exports.parseModuleDeps = parseModuleDeps;
//# sourceMappingURL=parsers.js.map