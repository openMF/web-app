import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { OfficeItemNode } from './office-item.class';

@Injectable({
    providedIn: 'root'
})
export class ChecklistDatabase {


    // rxjs functionality to update DOM via subscribe
    dataChange = new BehaviorSubject<OfficeItemNode[]>([]);
    get data(): OfficeItemNode[] {
        return this.dataChange.value;
    }
    TREE_DATA = {};

    constructor() {
    }

    // called every time the data in route changes
    initialize(trie: any) {
        this.TREE_DATA = trie;
        const data = this.buildFileTree(this.TREE_DATA, 0);
        this.dataChange.next(data);
    }

    // builds hierarchical tree of officeItemNodes
    buildFileTree(obj: { [key: string]: any }, level: number): OfficeItemNode[] {
        return Object.keys(obj).reduce<OfficeItemNode[]>((accumulator, key) => {
            const value = obj[key];
            const node = new OfficeItemNode();
            node.item = key;

            if (value != null) {
                if (typeof value === 'object') {
                    node.children = this.buildFileTree(value, level + 1);
                } else {
                    node.item = value;
                }
            }

            return accumulator.concat(node);
        }, []);
    }
}
