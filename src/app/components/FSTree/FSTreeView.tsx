import { TreeView } from '@material-ui/lab';
import React, { FC, useContext, useMemo } from 'react';
import { Dir, makeNodeId, makeTree, ModuleCategories } from './treeUtils';
import { DirItemChildren, TreeItemWithCheckbox } from './TreeItem';
import { TreeViewSelectContext } from './TreeViewSelectContext';

const CategoryView: FC<{
  label: string;
  category: keyof ModuleCategories;
  categories: ModuleCategories;
}> = ({ label, category, categories }) => {
  const { selected } = useContext(TreeViewSelectContext);
  const modulesTree = useMemo(() => {
    const selectedInCategory = selected
      .filter(s => s.startsWith(`${category}::`))
      .map(s => s.slice(category.length + 2));
    const builtTree = categories[category].reduce<Dir>(
      (acc, module) =>
        makeTree(
          acc,
          [category, ...module.path.split('/')],
          module,
          selectedInCategory.includes(module.path),
        ),
      {},
    );
    return builtTree[category];
  }, [category, categories, selected]);
  return (
    // defaultCollapseIcon={<TreeViewIcon iconName='folder-project-open'/>}
    <TreeItemWithCheckbox
      nodeId={makeNodeId({ category })}
      label={label}
      iconName="folder-project"
      selected={modulesTree.selected}
    >
      <DirItemChildren
        category={category}
        path={[]}
        dir={modulesTree.children}
      />
    </TreeItemWithCheckbox>
  );
};

const FSTreeView: FC<{ modulesCategories: ModuleCategories }> = ({
  modulesCategories,
}) => {
  return (
    <TreeView>
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

export default FSTreeView;
