/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { BehaviorSubject } from 'rxjs';

/** Custom Components */
import { OfficeNode } from './office-node.model';

/**
 * Office tree service.
 */
@Injectable({
  providedIn: 'root'
})
export class OfficeTreeService {

  /** Office data. */
  officesData: any;
  /** Offices tree data behavior subject to represent offices tree nodes. */
  treeDataChange = new BehaviorSubject<OfficeNode[]>([]);

  /**
   * Gets the offices tree nodes.
   */
  get treeData(): OfficeNode[] { return this.treeDataChange.value; }

  constructor() {  }

  /**
   * Builds the offices tree and emits the value.
   * @param {any} officesData Offices data.
   */
  initialize(officesData: any) {
    const treeData = this.buildOfficeTree(officesData);
    this.treeDataChange.next(treeData);
  }

  /**
   * Builds and returns the offices tree.
   * @param {any} officeData Offices data.
   * @returns {OfficeNode} Offices tree nodes.
   */
  buildOfficeTree(officesData: any): OfficeNode[] {
    const officeTree: OfficeNode[] = [];

    // Header nodes
    const mainOffice = officesData.find((office: any) => office.hierarchy === '.');
    officeTree.push(new OfficeNode(mainOffice.name, mainOffice.id));

    // Sort by parent id (so that child nodes can be added properly)
    officesData.sort((officeOne: any, officeTwo: any) => {
      if (!officeOne.parentId) {
        officeOne.parentId = 0;
      }
      return officeOne.parentId - officeTwo.parentId;
    });

    const offices: OfficeNode[] = [];

    // Add offices to any array where index for each is denoted by its id
    for (const office of officesData) {
      offices[office.id] =
        new OfficeNode(office.name, office.id, office.parentId, office.hierarchy, office.externalId, office.parentName, office.openingDate);
    }

    // Construct offices tree by adding all nodes belonging to headers (with parent id = 0),
    // and rest as children to respective parent nodes.
    for (const office of officesData) {
      if (office.hierarchy !== '.') {
        if (office.parentId === 1) {
          officeTree[0].children.push(offices[office.id]);
        } else {
          offices[office.parentId].children.push(offices[office.id]);
        }
      }
    }
    return officeTree;
  }

}
