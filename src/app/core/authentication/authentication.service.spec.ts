import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthenticationService } from './authentication.service';
import { AlertService } from '../alert/alert.service';
import { AuthenticationInterceptor } from './authentication.interceptor';
import { environment } from '../../../environments/environment';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let httpMock: HttpTestingController;
  let alertService: any;
  let authInterceptor: any;
  let originalEnvironment: any;

  beforeEach(() => {
    // Clear storage BEFORE creating the service
    localStorage.clear();
    sessionStorage.clear();

    const alertServiceSpy = {
      alert: jest.fn()
    };
    const authInterceptorSpy = {
      setAuthorizationToken: jest.fn(),
      setTwoFactorAccessToken: jest.fn(),
      removeAuthorization: jest.fn(),
      removeAuthorizationTenant: jest.fn(),
      removeTwoFactorAuthorization: jest.fn()
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthenticationService,
        { provide: AlertService, useValue: alertServiceSpy },
        { provide: AuthenticationInterceptor, useValue: authInterceptorSpy }]
    });

    service = TestBed.inject(AuthenticationService);
    httpMock = TestBed.inject(HttpTestingController);
    alertService = TestBed.inject(AlertService);
    authInterceptor = TestBed.inject(AuthenticationInterceptor);

    // Store original environment
    originalEnvironment = { ...environment };
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    sessionStorage.clear();
    // Restore environment
    Object.assign(environment, originalEnvironment);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Add subsequent code blocks here
});
