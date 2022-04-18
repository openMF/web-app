/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';

/** rxjs Imports */
import { Observable, forkJoin, from } from 'rxjs';
import { map } from 'rxjs/operators';

/** Custom Services */
import { ClientsService } from '../clients.service';

/**
 * Client Contact Information resolver.
 */
@Injectable()
export class ClientContactInformationResolver implements Resolve<Object> {
    /**
     * @param {ClientsService} ClientsService Clients service.
     */
    constructor(private clientsService: ClientsService) { }
    /**
     * Returns the Client Contact Information data.
     * @returns {Observable<any>}
     */
    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        const clientId = route.parent.paramMap.get('clientId');
        let clientContactInformation: any;
        return this.clientsService.getClientContactInformation(clientId).pipe(map((contactInformation: any) => {
            clientContactInformation = contactInformation;
            const docObservable: Observable<any>[] = [];
            contactInformation.forEach((identity: any) => {
                docObservable.push(this.clientsService.getClientIdentificationDocuments(identity.id));
            });
            forkJoin(docObservable).subscribe(documents => {
                documents.forEach((document, index) => {
                    clientContactInformation[index].documents = document;
                });
            });
            return clientContactInformation;
        }));
    }
}
