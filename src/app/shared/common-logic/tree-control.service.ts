import { Injectable } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';

@Injectable({
  providedIn: 'root'
})
export class TreeControlService {
  constructor() {}

  toggleExpandCollapse(nestedTreeControl: NestedTreeControl<any>, isTreeExpanded: boolean) {
    if (isTreeExpanded) {
      nestedTreeControl.collapseAll();
    } else {
      nestedTreeControl.expandAll();
    }
    // Toggle the state
    return !isTreeExpanded;
  }
}
