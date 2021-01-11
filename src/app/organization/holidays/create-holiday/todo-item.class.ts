import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class TodoItemNode {
    children: TodoItemNode[];
    item: string;
}
