import React, { FC, useEffect, useState } from 'react';
import { Module, ModuleDeps } from '../utils/types';
import { TreeItem, TreeView } from '@material-ui/lab';
import { getIconUrlByName } from 'vscode-material-icons';
import { Icon } from '@material-ui/core';
import { ICONS_URL } from '../utils/icons';

type Props = {
  modules: Module[];
  onChange?: (modules: Module[]) => void;
};

const IgnoreModules: FC<Props> = ({ modules, onChange }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const modulesCategories = modules.reduce<{
    local: Module[];
    external: Module[];
  }>(
    (acc, module) => {
      if (module.isLocal) {
        acc.local.push(module);
      } else {
        acc.external.push(module);
      }
      return acc;
    },
    { local: [], external: [] },
  );

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

  const onNodeSelect = (_: React.ChangeEvent<{}>, nodeIds: string[]) => {
    const transformedNodeIds = new Set(
      nodeIds.flatMap(nodeId => {
        const [type, modulePath] = nodeId.split('::');
        if (!modulePath) {
          const modulesCategoriesRec = modulesCategories as Record<
            string,
            Module[]
          >;
          if (!(type in modulesCategories) || !modulesCategoriesRec[type]) {
            throw new Error();
          }
          return modulesCategoriesRec[type].map(mod => `${type}::${mod.path}`);
        }
        return [nodeId];
      }),
    );
    setSelected(prevs =>
      [...transformedNodeIds].reduce(
        (acc, n) =>
          acc.includes(n) ? acc.filter(v => v !== n) : acc.concat([n]),
        [...prevs],
      ),
    );
  };
  return (
    <TreeView
      multiSelect
      selected={selected}
      onNodeSelect={onNodeSelect}
      defaultCollapseIcon={
        <Icon fontSize="small" style={{ textAlign: 'center' }}>
          <img
            src={getIconUrlByName('folder-project-open', ICONS_URL)}
            style={{ display: 'flex', height: 'inherit', width: 'inherit' }}
          />
        </Icon>
      }
      defaultExpandIcon={
        <Icon fontSize="small" style={{ textAlign: 'center' }}>
          <img
            src={getIconUrlByName('folder-project', ICONS_URL)}
            style={{ display: 'flex', height: 'inherit', width: 'inherit' }}
          />
        </Icon>
      }
    >
      <TreeItem nodeId="local" label="Local modules">
        {modulesCategories.local.map(module => (
          <TreeItem nodeId={`local::${module.path}`} label={module.path} />
        ))}
      </TreeItem>
      <TreeItem nodeId="external" label="External modules">
        {modulesCategories.external.map(module => (
          <TreeItem nodeId={`external::${module.path}`} label={module.path} />
        ))}
      </TreeItem>
    </TreeView>
  );
};

export default IgnoreModules;
