export class OfficeTreeNode {
    name: string
    id:number
    levelName?:string
    children?: OfficeTreeNode[]   
    constructor() {
        
    }
}

export class OfficeFlatNode {
    expandable: boolean
    name: string
    level: number
    id:number
    hasChild:boolean
  }

  export class OfficeHierarchy{
    levelName:string;
    hierarchyType:string='OAF';
    descendant?:OfficeHierarchy[]
    children:any=[];
    collapsed:boolean=false;
    root:boolean=true;
    selected:string="selected";
    parentId:any=null;
  }
  export class OfficeHierarchyFlatNode {
    expandable: boolean
    levelName: string
    level: number
    id:number
    hasChild:boolean
  }