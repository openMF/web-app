import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class TodoItemFlatNode {
    item: string;
    level: number;
    expandable: boolean;
  }
