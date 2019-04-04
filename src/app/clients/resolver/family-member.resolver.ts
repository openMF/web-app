import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { ClientsService } from '../clients.service';

@Injectable()
export class FamilyMemberResolver implements Resolve<Object> {
    constructor(private clientService: ClientsService) { }

    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        const id = Number(route.paramMap.get('id'));
        return this.clientService.getClientFamilyMembersTemplate(id);
    }
}

