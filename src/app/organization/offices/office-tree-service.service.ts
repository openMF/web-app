/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { BehaviorSubject } from 'rxjs';

/** Custom Components */
import { Office, OfficeNode } from './office-node.model';

/**
 * Office tree service.
 */
@Injectable({
  providedIn: 'root'
})
export class OfficeTreeService {
  /** Offices tree data behavior subject to represent offices tree nodes. */
  treeDataChange = new BehaviorSubject<OfficeNode[]>([]);

  /**
   * Gets the offices tree nodes.
   */
  get treeData(): OfficeNode[] {
    return this.treeDataChange.value;
  }

  /**
   * Builds the offices tree and emits the value.
   * @param {Office[]} officesData Offices data.
   */
  initialize(officesData: Office[]) {
    this.treeDataChange.next(this.buildOfficeTree(officesData));
  }

  /**
   * Builds and returns the offices tree.
   * An office whose parent is not in the list is placed at the top level,
   * since the list may not include the head office.
   * @param {Office[]} officesData Offices data.
   * @returns {OfficeNode[]} Offices tree nodes.
   */
  buildOfficeTree(officesData: Office[]): OfficeNode[] {
    // Create a node for each office, indexed by its id
    const offices = new Map<number, OfficeNode>();
    for (const office of officesData || []) {
      offices.set(
        office.id,
        new OfficeNode(
          office.name,
          office.id,
          office.parentId,
          office.hierarchy,
          office.externalId,
          office.parentName,
          office.openingDate
        )
      );
    }

    // Add each office to its parent, or to the top level if its parent is not in the list
    const officeTree: OfficeNode[] = [];
    offices.forEach((office) => {
      const parent = office.parentId ? offices.get(office.parentId) : undefined;
      if (parent && parent !== office) {
        office.parent = parent;
        parent.children.push(office);
      } else {
        officeTree.push(office);
      }
    });

    const byName = (officeOne: OfficeNode, officeTwo: OfficeNode) => officeOne.name.localeCompare(officeTwo.name);
    officeTree.sort(byName);
    offices.forEach((office) => office.children.sort(byName));
    return officeTree;
  }
}
