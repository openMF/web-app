// import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';

// import { AuthenticationService } from './authentication.service';

// const credentialsStorageKey = 'mifosXCredentials';

// describe('AuthenticationService', () => {
//   let authenticationService: AuthenticationService;

//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       providers: [AuthenticationService]
//     });
//   });

//   beforeEach(inject([
//     AuthenticationService
//   ], (_authenticationService: AuthenticationService) => {
//     authenticationService = _authenticationService;
//   }));

//   afterEach(() => {
//     // Cleanup
//     localStorage.removeItem(credentialsStorageKey);
//     sessionStorage.removeItem(credentialsStorageKey);
//   });

//   describe('login', () => {
//     it('should return credentials', fakeAsync(() => {
//       // Act
//       const request = authenticationService.login({
//         username: 'mifos',
//         password: 'password',
//         remember: false
//       });
//       tick();

//       // Assert
//       request.subscribe(credentials => {
//         expect(credentials).toBeDefined();
//         // expect(credentials.token).toBeDefined();
//       });
//     }));

//     it('should authenticate user', fakeAsync(() => {
//       expect(authenticationService.isAuthenticated()).toBe(false);

//       // Act
//       const request = authenticationService.login({
//         username: 'mifos',
//         password: 'password',
//         remember: false
//       });
//       tick();

//       // Assert
//       request.subscribe(() => {
//         expect(authenticationService.isAuthenticated()).toBe(true);
//         // expect(authenticationService.credentials).toBeDefined();
//         // expect(authenticationService.credentials).not.toBeNull();
//         // expect((<Credentials>authenticationService.credentials).token).toBeDefined();
//         // expect((<Credentials>authenticationService.credentials).token).not.toBeNull();
//       });
//     }));

//     it('should persist credentials for the session', fakeAsync(() => {
//       // Act
//       const request = authenticationService.login({
//         username: 'mifos',
//         password: 'password',
//         remember: false
//       });
//       tick();

//       // Assert
//       request.subscribe(() => {
//         expect(sessionStorage.getItem(credentialsStorageKey)).not.toBeNull();
//       });
//     }));

//     it('should persist credentials across sessions', fakeAsync(() => {
//       // Act
//       const request = authenticationService.login({
//         username: 'mifos',
//         password: 'password',
//         remember: true
//       });
//       tick();

//       // Assert
//       request.subscribe(() => {
//         expect(localStorage.getItem(credentialsStorageKey)).not.toBeNull();
//       });
//     }));
//   });

//   describe('logout', () => {
//     it('should clear user authentication', fakeAsync(() => {
//       // Arrange
//       const loginRequest = authenticationService.login({
//         username: 'mifos',
//         password: 'password',
//         remember: false
//       });
//       tick();

//       // Assert
//       loginRequest.subscribe(() => {
//         expect(authenticationService.isAuthenticated()).toBe(true);

//         const request = authenticationService.logout();
//         tick();

//         request.subscribe(() => {
//           expect(authenticationService.isAuthenticated()).toBe(false);
//           // expect(authenticationService.credentials).toBeNull();
//           expect(sessionStorage.getItem(credentialsStorageKey)).toBeNull();
//           expect(localStorage.getItem(credentialsStorageKey)).toBeNull();
//         });
//       });
//     }));

//     it('should clear persisted user authentication', fakeAsync(() => {
//       // Arrange
//       const loginRequest = authenticationService.login({
//         username: 'mifos',
//         password: 'password',
//         remember: true
//       });
//       tick();

//       // Assert
//       loginRequest.subscribe(() => {
//         expect(authenticationService.isAuthenticated()).toBe(true);

//         const request = authenticationService.logout();
//         tick();

//         request.subscribe(() => {
//           expect(authenticationService.isAuthenticated()).toBe(false);
//           // expect(authenticationService.credentials).toBeNull();
//           expect(sessionStorage.getItem(credentialsStorageKey)).toBeNull();
//           expect(localStorage.getItem(credentialsStorageKey)).toBeNull();
//         });
//       });
//     }));
//   });
// });
