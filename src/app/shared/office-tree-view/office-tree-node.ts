export class OfficeTreeNode {
    name: string
    levelName?:string
    children?: OfficeTreeNode[]   
    constructor() {
        
    }
}

export class OfficeFlatNode {
    expandable: boolean
    name: string
    level: number
  }