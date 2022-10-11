export class OfficeTreeNode {
    name: string;
    id: number;
    levelName?: string;
    children?: OfficeTreeNode[];
    checked:boolean;
    constructor() {

    }
}

export class OfficeFlatNode {
    expandable: boolean;
    name: string;
    level: number;
    id: number;
    hasChild: boolean;
    checked: boolean;
  }

  export class OfficeHierarchy {
    levelName: string;
    hierarchyType = 'OAF';
    descendant?: OfficeHierarchy[];
    children: any = [];
    collapsed = false;
    root = true;
    selected = 'selected';
    parentId: any = null;
  }
  export class OfficeHierarchyFlatNode {
    expandable: boolean;
    levelName: string;
    level: number;
    id: number;
    hasChild: boolean;
  }
