import { createContext } from 'react';
import { NodeIdStr } from './treeUtils';

export const TreeViewSelectContext = createContext({
  changeSelect: (nodeId: NodeIdStr, prevSelected: boolean | null) => {},
  selected: [] as string[],
});
