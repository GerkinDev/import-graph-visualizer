import React, { FC, useCallback, useEffect, useState } from 'react';
import { Module } from '../utils/types';
import FSTreeView from './FSTree/FSTreeView';
import {
  ModuleCategories,
  NodeId,
  NodeIdStr,
  parseNodeId,
} from './FSTree/treeUtils';
import { TreeViewSelectContext } from './FSTree/TreeViewSelectContext';

type Props = {
  modules: Module[];
  onChange?: (modules: Module[]) => void;
};

const expandNodeIdSelection = (
  nodeId: NodeId,
  modulesCategories: ModuleCategories,
) => {
  let stateUpdates: string[] = [];
  if (
    !(nodeId.category in modulesCategories) ||
    !modulesCategories[nodeId.category]
  ) {
    throw new Error();
  }
  if (nodeId.isSelf) {
    if (!nodeId.path) {
      throw new Error('Non implemented');
    }
    stateUpdates.push(nodeId.path.join('/'));
  } else {
    if (nodeId.path) {
      const prefix = nodeId.path.join('/');
      stateUpdates.push(
        ...modulesCategories[nodeId.category]
          .filter(
            mod => mod.path === prefix || mod.path.startsWith(prefix + '/'),
          )
          .map(mod => mod.path),
      );
    } else {
      stateUpdates.push(
        ...modulesCategories[nodeId.category].map(mod => mod.path),
      );
    }
  }
  return stateUpdates.map(path => `${nodeId.category}::${path}`);
};

const IgnoreModules: FC<Props> = ({ modules, onChange }) => {
  const modulesCategories = modules.reduce<ModuleCategories>(
    (acc, module) => {
      if (module.isLocal) {
        acc.local.push(module);
      } else if (module.isNodeBuiltIn) {
        acc.builtIns.push(module);
      } else {
        acc.external.push(module);
      }
      return acc;
    },
    { local: [], external: [], builtIns: [] },
  );
  const [selected, setSelected] = useState<string[]>([
    ...modulesCategories.builtIns.map(module => `builtIns::${module.path}`),
    ...modulesCategories.external.map(module => `external::${module.path}`),
  ]);

  useEffect(() => {
    if (!onChange) {
      return;
    }
    onChange(
      selected
        .map(nodeId => {
          const [, modPath] = nodeId.split('::');
          return modules.find(module => module.path === modPath);
        })
        .filter((v): v is Module => !!v),
    );
  }, [selected, onChange]);

  const onNodeSelect = useCallback(
    (nodeIdStr: NodeIdStr, prevSelected: boolean | null) => {
      const nodeId = parseNodeId(nodeIdStr);
      const stateUpdates = [
        ...new Set(expandNodeIdSelection(nodeId, modulesCategories)),
      ];
      setSelected(prevs => [
        ...new Set(
          stateUpdates.reduce(
            (acc, n) =>
              prevSelected ? acc.filter(v => v !== n) : acc.concat([n]),
            [...prevs],
          ),
        ),
      ]);
    },
    [setSelected],
  );
  return (
    <TreeViewSelectContext.Provider
      value={{ changeSelect: onNodeSelect, selected }}
    >
      <FSTreeView modulesCategories={modulesCategories} />
    </TreeViewSelectContext.Provider>
  );
};

export default IgnoreModules;
