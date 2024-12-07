import { Module } from '../../utils/types';

export type DirItem = {
  children: Dir;
  self?: Module;
  selfSelected: boolean | null;
  selected: boolean | null;
};
export type Dir = { [key: string]: DirItem };
export const makeTree = (
  acc: Dir,
  pathSegments: string[],
  module: Module,
  selected: boolean,
) => {
  const [currentSegment, ...nextSegments] = pathSegments;
  if (nextSegments.length === 0) {
    if (acc[currentSegment]?.self) {
      console.error({ module, acc });
      throw new Error();
    }
    acc[currentSegment] = {
      self: module,
      children: {},
      selected,
      selfSelected: selected,
    };
  } else {
    const dir = acc[currentSegment] ?? {
      children: {},
      selected,
      selfSelected: selected,
    };
    const children = makeTree(dir.children, nextSegments, module, selected);
    acc[currentSegment] = {
      ...dir,
      selected: dir.selected === selected ? dir.selected : null,
      children,
    };
  }

  return acc;
};

export type ModuleCategories = {
  local: Module[];
  external: Module[];
  builtIns: Module[];
};

export type NodeIdStr = string & {};
export type NodeId = {
  category: keyof ModuleCategories;
  path?: string[];
  isSelf?: boolean;
};
export const makeNodeId = (nodeId: NodeId): NodeIdStr => {
  return JSON.stringify(nodeId);
};

export const parseNodeId = (nodeId: NodeIdStr): NodeId => {
  return JSON.parse(nodeId);
};
