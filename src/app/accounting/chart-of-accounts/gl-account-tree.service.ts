/** Angular Imports */
import { Injectable } from '@angular/core';

/** rxjs Imports */
import { BehaviorSubject } from 'rxjs';

/** Custom Components */
import { GLAccountNode } from './gl-account-node.model';

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
  get treeData(): GLAccountNode[] { return this.treeDataChange.value; }

  constructor() {  }

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
   * @param {any} glAccountData Chart of accounts data.
   * @returns {GLAccountNode[]} Chart of accounts tree nodes.
   */
  buildGLAccountTree(glAccountData: any): GLAccountNode[] {
    const glAccountTree: GLAccountNode[] = [];

    // Header nodes
    glAccountTree.push(new GLAccountNode('GL ACCOUNTS'));
    glAccountTree[0].children.push(new GLAccountNode('ASSET'));
    glAccountTree[0].children.push(new GLAccountNode('EQUITY'));
    glAccountTree[0].children.push(new GLAccountNode('EXPENSE'));
    glAccountTree[0].children.push(new GLAccountNode('INCOME'));
    glAccountTree[0].children.push(new GLAccountNode('LIABILITY'));

    // Sort by parent id (so that child nodes can be added properly)
    glAccountData.sort((glAccountOne: any, glAccountTwo: any) => {
      if (!glAccountOne.parentId) {
        glAccountOne.parentId = 0;
      }
      return glAccountOne.parentId - glAccountTwo.parentId;
    });

    const glAccounts: GLAccountNode[] = [];

    // Add gl accounts to any array where index for each is denoted by its id
    for (const glAccount of glAccountData) {
      glAccounts[glAccount.id] =
        new GLAccountNode(glAccount.name, glAccount.glCode, glAccount.type.value, glAccount.usage.value, glAccount.manualEntriesAllowed, glAccount.description);
    }

    // Construct gl account tree by adding all nodes belonging to headers (with parent id = 0) by their type,
    // and rest as children to respective parent nodes.
    for (const glAccount of glAccountData) {
      if (glAccount.parentId === 0) {
        if (glAccount.type.value === 'ASSET') {
          glAccountTree[0].children[0].children.push(glAccounts[glAccount.id]);
        } else if (glAccount.type.value === 'EQUITY') {
          glAccountTree[0].children[1].children.push(glAccounts[glAccount.id]);
        } else if (glAccount.type.value === 'EXPENSE') {
          glAccountTree[0].children[2].children.push(glAccounts[glAccount.id]);
        } else if (glAccount.type.value === 'INCOME') {
          glAccountTree[0].children[3].children.push(glAccounts[glAccount.id]);
        } else if (glAccount.type.value === 'LIABILITY') {
          glAccountTree[0].children[4].children.push(glAccounts[glAccount.id]);
        }
      } else {
        glAccounts[glAccount.parentId].children.push(glAccounts[glAccount.id]);
      }
    }

    return glAccountTree;
  }

}
