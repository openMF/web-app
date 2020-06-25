/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { SystemService } from '../system.service';

/**
 * Maker Checker Tasks resolver.
 */
@Injectable()
export class MakerCheckerTasksResolver implements Resolve<Object> {

    /**
     * @param {SystemService} systemService System service.
     */
    constructor(private systemService: SystemService) { }

    /**
     * Returns all the Configurable Maker Checker Tasks.
     * @returns {Observable<any>}
     */
    resolve(): Observable<any> {
        return this.systemService.getMakerCheckerPermissions();
    }

}
