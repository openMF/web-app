/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

// import { Observable, of } from 'rxjs';

// import { Credentials, LoginContext } from './authentication.service';

// export class MockAuthenticationService {

//   credentials: Credentials | null = {
//     username: 'test',
//     token: '123'
//   };

//   login(context: LoginContext): Observable<Credentials> {
//     return of({
//       username: context.username,
//       token: '123456'
//     });
//   }

//   logout(): Observable<boolean> {
//     this.credentials = null;
//     return of(true);
//   }

//   isAuthenticated(): boolean {
//     return !!this.credentials;
//   }

// }
