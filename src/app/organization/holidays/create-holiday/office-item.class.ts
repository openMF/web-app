import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class OfficeItemNode {
    children: OfficeItemNode[];
    item: string;
}
