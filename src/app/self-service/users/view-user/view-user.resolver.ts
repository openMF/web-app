import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

import { Observable, of } from 'rxjs';
import { UserService } from '../user.service';

@Injectable()
export class ViewUserResolver implements Resolve<Object> {

  constructor(private userService: UserService) {}

  resolve(): Observable<any> {
    return this.userService.getUser();
  }

}
