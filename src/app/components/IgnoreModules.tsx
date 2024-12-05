import React, { FC, Fragment, useEffect, useMemo, useState } from 'react';
import { Module, ModuleDeps } from '../utils/types';
import { TreeItem, TreeView } from '@material-ui/lab';
import { getIconUrlByName } from 'vscode-material-icons';
import { Icon } from '@material-ui/core';
import { ICONS_URL } from '../utils/icons';

type DirItem = {
  children: Dir;
  self?: Module;
};
type Dir = { [key: string]: DirItem };
const makeTree = (acc: Dir, pathSegments: string[], module: Module) => {
  const [currentSegment, ...nextSegments] = pathSegments;
  if (nextSegments.length === 0) {
    if (acc[currentSegment]?.self) {
      console.error({ module, acc });
      throw new Error();
    }
    acc[currentSegment] = { self: module, children: {} };
  } else {
    const dir = acc[currentSegment] ?? { children: {} };
    acc[currentSegment] = {
      ...dir,
      children: makeTree(dir.children, nextSegments, module),
    };
  }

  return acc;
};

const DirItemChildren: FC<{
  category: keyof ModuleCategories;
  path: string[];
  dir: Dir;
}> = ({ category, dir, path }) => {
  return (
    <Fragment>
      {Object.entries(dir).map(([segment, subDirItem]) => (
        <DirItemView
          category={category}
          path={[...path, segment]}
          dirItem={subDirItem}
        />
      ))}
    </Fragment>
  );
};

const DirItemView: FC<{
  category: keyof ModuleCategories;
  path: string[];
  dirItem: DirItem;
}> = ({ category, dirItem, path }) => {
  if (Object.keys(dirItem.children).length === 0) {
    if (!dirItem.self) {
      throw new Error();
    }
    return (
      <TreeItem
        nodeId={`${category}::${path.join('/')}`}
        label={path[path.length - 1]}
      />
    );
  }
  return (
    <TreeItem
      nodeId={`${category}::${path.join('/')}`}
      label={path[path.length - 1]}
    >
      {dirItem.self && (
        <TreeItem nodeId={`${category}::${path.join('/')}`} label="_" />
      )}
      <DirItemChildren category={category} path={path} dir={dirItem.children} />
    </TreeItem>
  );
};

const CategoryView: FC<{
  label: string;
  category: keyof ModuleCategories;
  categories: ModuleCategories;
}> = ({ label, category, categories }) => {
  const modulesTree = useMemo(() => {
    const builtTree = categories[category].reduce<Dir>(
      (acc, module) => makeTree(acc, module.path.split('/'), module),
      {},
    );
    return builtTree;
  }, [category, categories]);
  return (
    <TreeItem nodeId={category} label={label}>
      <DirItemChildren category={category} path={[]} dir={modulesTree} />
    </TreeItem>
  );
};

type ModuleCategories = {
  local: Module[];
  external: Module[];
  builtIns: Module[];
};

type Props = {
  modules: Module[];
  onChange?: (modules: Module[]) => void;
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
  const [selected, setSelected] = useState<string[]>(
    modulesCategories.builtIns.map(module => `builtIns::${module.path}`),
  );

  useEffect(() => {
    if (!onChange) {
      return;
    }
    console.log(selected);
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
      <CategoryView
        categories={modulesCategories}
        label="Local modules"
        category="local"
      />
      <CategoryView
        categories={modulesCategories}
        label="External modules"
        category="external"
      />
      <CategoryView
        categories={modulesCategories}
        label="Built-in modules"
        category="builtIns"
      />
    </TreeView>
  );
};

export default IgnoreModules;
