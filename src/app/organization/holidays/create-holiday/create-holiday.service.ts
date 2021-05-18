import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CreateHoliday {
    setEmptyObjectsToNull(root: any) {
        Object.keys(root).forEach((key) => {
            if (Object.keys(root[key]).length === 0) {
                root[key] = null;
            } else {
                this.setEmptyObjectsToNull(root[key]);
            }
        });
    }

}
