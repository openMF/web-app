/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { CentersService } from '../centers.service';

/**
 * center datatables resolver.
 */
@Injectable()
export class CenterDatatablesResolver implements Resolve<Object> {

    /**
     * @param {centersService} centersService centers service.
     */
    constructor(private centersService: CentersService) { }

    /**
     * Returns the center datatables.
     * @returns {Observable<any>}
     */
    resolve(): Observable<any> {
        return this.centersService.getcenterDatatables();
    }

}
