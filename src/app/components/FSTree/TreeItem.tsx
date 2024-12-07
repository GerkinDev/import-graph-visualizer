import { Checkbox, Icon } from '@material-ui/core';
import React, { FC, Fragment, MouseEvent, useContext } from 'react';
import { getIconUrlByName, MaterialIcon } from 'vscode-material-icons';
import { ICONS_URL } from '../../utils/icons';
import { TreeItem, TreeItemProps } from '@material-ui/lab';
import styled from 'styled-components';
import { Dir, DirItem, makeNodeId, ModuleCategories } from './treeUtils';
import { TreeViewSelectContext } from './TreeViewSelectContext';

type OnCheckFn = (
  event: MouseEvent<HTMLButtonElement>,
  currentSelected: boolean | null,
) => void;

type TreeViewIconProps = {
  iconName?: MaterialIcon;
  selected?: boolean | null;
  onCheck?: OnCheckFn;
};

const TreeViewIcon: FC<TreeViewIconProps> = ({
  iconName,
  selected,
  onCheck,
}) => (
  <>
    {iconName && (
      <Icon fontSize="small" style={{ textAlign: 'center' }}>
        <img
          src={getIconUrlByName(iconName, ICONS_URL)}
          style={{ display: 'flex', height: 'inherit', width: 'inherit' }}
        />
      </Icon>
    )}
    {selected !== undefined && (
      <Checkbox
        style={{ padding: '0' }}
        onClick={onCheck && (event => onCheck(event, selected))}
        indeterminate={selected === null}
        checked={!!selected}
      />
    )}
  </>
);

export const TreeItemWithCheckbox = styled(
  ({
    children,
    iconName,
    selected,
    nodeId,
    ...rest
  }: Omit<TreeItemProps, 'icon'> & Omit<TreeViewIconProps, 'onCheck'>) => {
    const { changeSelect } = useContext(TreeViewSelectContext);
    return (
      <TreeItem
        {...rest}
        nodeId={nodeId}
        icon={
          (iconName || selected !== undefined) && (
            <TreeViewIcon
              iconName={iconName}
              selected={selected}
              onCheck={(event, prevSelected) => {
                event.stopPropagation();
                changeSelect(nodeId, prevSelected);
              }}
            />
          )
        }
      >
        {children}
      </TreeItem>
    );
  },
)`
  & .MuiTreeItem-iconContainer {
    width: 40px;
  }
`;

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
      <TreeItemWithCheckbox
        selected={dirItem.selfSelected}
        nodeId={makeNodeId({ category, path, isSelf: true })}
        label={path[path.length - 1]}
        iconName="javascript"
      />
    );
  }
  return (
    <TreeItemWithCheckbox
      selected={dirItem.selected}
      nodeId={makeNodeId({ category, path })}
      label={path[path.length - 1]}
      iconName={dirItem.self ? 'folder-javascript' : 'folder-project'}
    >
      {dirItem.self && (
        <TreeItemWithCheckbox
          selected={dirItem.selfSelected}
          nodeId={makeNodeId({ category, path, isSelf: true })}
          label={<em>Index</em>}
          iconName="javascript"
        />
      )}
      <DirItemChildren category={category} path={path} dir={dirItem.children} />
    </TreeItemWithCheckbox>
  );
};

export const DirItemChildren: FC<{
  category: keyof ModuleCategories;
  path: string[];
  dir: Dir;
}> = ({ category, dir, path }) => {
  return (
    <Fragment>
      {Object.entries(dir).map(([segment, subDirItem]) => (
        <DirItemView
          key={segment}
          category={category}
          path={[...path, segment]}
          dirItem={subDirItem}
        />
      ))}
    </Fragment>
  );
};
