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
import { GLAccountNode } from './gl-account-node.model';
import { GLAccount } from 'app/shared/models/general.model';

/** Account types in the order they are listed in the chart of accounts. */
export const GL_ACCOUNT_TYPES = [
  'ASSET',
  'LIABILITY',
  'EQUITY',
  'INCOME',
  'EXPENSE'
] as const;

/** Account type of a GL Account. */
export type GLAccountType = (typeof GL_ACCOUNT_TYPES)[number];

/**
 * GL Account tree service.
 */
@Injectable({
  providedIn: 'root'
})
export class GlAccountTreeService {
  /** GL Account data. */
  glAccountData: any;
  /** Chart of accounts tree data behavior subject to represent chart of accounts tree nodes. */
  treeDataChange = new BehaviorSubject<GLAccountNode[]>([]);

  /**
   * Gets the chart of accounts tree nodes.
   */
  get treeData(): GLAccountNode[] {
    return this.treeDataChange.value;
  }

  /**
   * Builds the chart of accounts tree and emits the value.
   * @param {any} glAccountData Chart of accounts data.
   */
  initialize(glAccountData: any) {
    const treeData = this.buildGLAccountTree(glAccountData);
    this.treeDataChange.next(treeData);
  }

  /**
   * Builds and returns the chart of accounts tree.
   * The top level holds one group per account type, each containing the accounts of that type.
   * @param {any} glAccountData Chart of accounts data.
   * @returns {GLAccountNode[]} Chart of accounts tree nodes.
   */
  buildGLAccountTree(glAccountData: GLAccount[]): GLAccountNode[] {
    // One group per account type
    const typeGroups = new Map<string, GLAccountNode>();
    for (const type of GL_ACCOUNT_TYPES) {
      const typeGroup = new GLAccountNode(type, '', type);
      typeGroup.isTypeGroup = true;
      typeGroups.set(type, typeGroup);
    }
    const glAccountTree = Array.from(typeGroups.values());

    // Create a node for each gl account, indexed by its id
    const glAccounts = new Map<number, GLAccountNode>();
    for (const glAccount of glAccountData || []) {
      const node = new GLAccountNode(
        glAccount.name,
        glAccount.glCode,
        glAccount.type?.value,
        glAccount.usage?.value,
        glAccount.manualEntriesAllowed,
        glAccount.description
      );
      node.id = glAccount.id;
      node.typeId = glAccount.type?.id;
      node.disabled = !!glAccount.disabled;
      node.tagName = glAccount.tagId?.name || '';
      glAccounts.set(glAccount.id, node);
    }

    // Add each gl account to its parent account, or to its account type if it has no parent
    for (const glAccount of glAccountData || []) {
      const node = glAccounts.get(glAccount.id);
      const parent = glAccount.parentId ? glAccounts.get(glAccount.parentId) : undefined;
      if (parent && parent !== node) {
        node.parent = parent;
        parent.children.push(node);
      } else {
        typeGroups.get(node.type)?.children.push(node);
      }
    }

    return glAccountTree;
  }
}
