import { Component, Input, OnInit, ViewChild } from '@angular/core'
import { FlatTreeControl } from '@angular/cdk/tree'
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree'
import { OfficeFlatNode, OfficeTreeNode } from './office-tree-node'
import { Router } from '@angular/router'


@Component({
  selector: 'mifosx-office-tree-view',
  templateUrl: './office-tree-view.component.html',
  styleUrls: ['./office-tree-view.component.scss']
})

export class OfficeTreeViewComponent implements OnInit {
  @Input() treeDataSource:OfficeTreeNode[]=[]
  @ViewChild('officeTree') officeTree!:any;
  constructor (private router:Router) {}
  private _transformer = (node: OfficeTreeNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
      id:node.id
    }
  }
  treeControl = new FlatTreeControl<OfficeFlatNode>(
    node => node.level,
    node => node.expandable
  )
  treeFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => node.children
  )
  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener)

  hasChild = (_: number, node: OfficeFlatNode) => node.expandable
  
  ngOnInit (): void {
    this.dataSource.data = this.treeDataSource
  }

  createOffice(parentId:number){
    this.router.navigate(['/organization/offices/create'],{state:{id:parentId}})
  }
}
