import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { GLAccountNode } from './gl-account-node.model';

@Injectable({
  providedIn: 'root'
})
export class GlAccountTreeService {

  glAccountData: any;

  treeDataChange = new BehaviorSubject<GLAccountNode[]>([]);

  get treeData(): GLAccountNode[] { return this.treeDataChange.value; }

  constructor() {  }

  initialize(glAccountData: any) {
    const data = this.buildGLAccountTree(glAccountData);
    this.treeDataChange.next(data);
  }

  buildGLAccountTree(glAccountData: any): GLAccountNode[] {
    const glAccountTree: GLAccountNode[] = [];

    glAccountTree.push(new GLAccountNode('GL ACCOUNTS'));
    glAccountTree[0].children.push(new GLAccountNode('ASSET'));
    glAccountTree[0].children.push(new GLAccountNode('EQUITY'));
    glAccountTree[0].children.push(new GLAccountNode('EXPENSE'));
    glAccountTree[0].children.push(new GLAccountNode('INCOME'));
    glAccountTree[0].children.push(new GLAccountNode('LIABILITY'));

    glAccountData.sort((glAccountOne: any, glAccountTwo: any) => {
      if (!glAccountOne.parentId) {
        glAccountOne.parentId = 0;
      }
      return glAccountOne.parentId - glAccountTwo.parentId;
    });

    const glAccounts: GLAccountNode[] = [];

    for (const glAccount of glAccountData) {
      glAccounts[glAccount.id] =
        new GLAccountNode(glAccount.name, glAccount.glCode, glAccount.type.value, glAccount.usage.value, glAccount.manualEntriesAllowed, glAccount.description);
    }

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
