import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class OfficeItemFlatNode {
    item: string;
    level: number;
    expandable: boolean;
  }
