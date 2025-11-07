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
describe('Basic Authentication Login', () => {
  beforeEach(() => {
    (environment as any).oauth = { enabled: false };
  });

  it('should login successfully with basic authentication', (done) => {
    const loginContext = { username: 'testuser', password: 'password', remember: false };
    const mockCredentials: any = {
      username: 'testuser',
      userId: 1,
      base64EncodedAuthenticationKey: 'dGVzdHVzZXI6cGFzc3dvcmQ=',
      authenticated: true,
      officeId: 1,
      officeName: 'Head Office',
      roles: [] as any[],
      permissions: [] as any[],
      shouldRenewPassword: false,
      isTwoFactorAuthenticationRequired: false
    };

    service.login(loginContext).subscribe(() => {
      expect(authInterceptor.setAuthorizationToken).toHaveBeenCalledWith(
        mockCredentials.base64EncodedAuthenticationKey
      );
      expect(alertService.alert).toHaveBeenCalledWith({
        type: 'Authentication Success',
        message: `${mockCredentials.username} successfully logged in!`
      });
      done();
    });

    const req = httpMock.expectOne('/authentication');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      username: loginContext.username,
      password: loginContext.password,
      remember: false
    });
    req.flush(mockCredentials);
  });

  it('should login with remember me enabled', (done) => {
    (environment as any).enableRememberMe = true;
    const loginContext = { username: 'testuser', password: 'password', remember: true };
    const mockCredentials: any = {
      username: 'testuser',
      userId: 1,
      base64EncodedAuthenticationKey: 'dGVzdHVzZXI6cGFzc3dvcmQ=',
      authenticated: true,
      officeId: 1,
      officeName: 'Head Office',
      roles: [] as any[],
      permissions: [] as any[],
      shouldRenewPassword: false,
      isTwoFactorAuthenticationRequired: false,
      rememberMe: true
    };

    service.login(loginContext).subscribe(() => {
      const storedCredentials = JSON.parse(localStorage.getItem('mifosXCredentials'));
      expect(storedCredentials.rememberMe).toBe(true);
      done();
    });

    const req = httpMock.expectOne('/authentication');
    req.flush(mockCredentials);
  });

  it('should alert when two factor authentication is required', (done) => {
    const loginContext = { username: 'testuser', password: 'password', remember: false };
    const mockCredentials: any = {
      username: 'testuser',
      userId: 1,
      base64EncodedAuthenticationKey: 'dGVzdHVzZXI6cGFzc3dvcmQ=',
      authenticated: true,
      officeId: 1,
      officeName: 'Head Office',
      roles: [] as any[],
      permissions: [] as any[],
      shouldRenewPassword: false,
      isTwoFactorAuthenticationRequired: true
    };

    service.login(loginContext).subscribe(() => {
      expect(alertService.alert).toHaveBeenCalledWith({
        type: 'Two Factor Authentication Required',
        message: 'Two Factor Authentication Required'
      });
      done();
    });

    const req = httpMock.expectOne('/authentication');
    req.flush(mockCredentials);
  });

  it('should alert when password has expired', (done) => {
    const loginContext = { username: 'testuser', password: 'password', remember: false };
    const mockCredentials: any = {
      username: 'testuser',
      userId: 1,
      base64EncodedAuthenticationKey: 'dGVzdHVzZXI6cGFzc3dvcmQ=',
      authenticated: true,
      officeId: 1,
      officeName: 'Head Office',
      roles: [] as any[],
      permissions: [] as any[],
      shouldRenewPassword: true,
      isTwoFactorAuthenticationRequired: false
    };

    service.login(loginContext).subscribe(() => {
      expect(alertService.alert).toHaveBeenCalledWith({
        type: 'Password Expired',
        message: 'Your password has expired, please reset your password!'
      });
      done();
    });

    const req = httpMock.expectOne('/authentication');
    req.flush(mockCredentials);
  });
});
describe('OAuth2 Authentication', () => {
  beforeEach(() => {
    (environment as any).oauth = {
      enabled: true,
      serverUrl: 'https://oauth.server.com',
      appId: 'test-app-id'
    };
    (environment as any).serverUrl = 'https://api.server.com';
  });

  it('should login successfully with OAuth2', (done) => {
    const loginContext = { username: 'testuser', password: 'password', remember: false };
    const mockTokenResponse: any = {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      token_type: 'Bearer'
    };
    const mockUserDetails: any = {
      username: 'testuser',
      userId: 1,
      authenticated: true,
      officeId: 1,
      officeName: 'Head Office',
      roles: [] as any[],
      permissions: [] as any[],
      shouldRenewPassword: false,
      isTwoFactorAuthenticationRequired: false,
      accessToken: 'mock-access-token'
    };

    service.login(loginContext).subscribe();

    const tokenReq = httpMock.expectOne('https://oauth.server.com/token');
    expect(tokenReq.request.method).toBe('POST');
    tokenReq.flush(mockTokenResponse);

    // Wait for the user details request
    setTimeout(() => {
      const userDetailsReq = httpMock.expectOne('https://api.server.com/userdetails');
      expect(userDetailsReq.request.method).toBe('GET');
      userDetailsReq.flush(mockUserDetails);

      // Give time for the observable to complete
      setTimeout(() => {
        expect(authInterceptor.setAuthorizationToken).toHaveBeenCalledWith('mock-access-token');
        done();
      }, 100);
    }, 100);
  });

  it('should store OAuth token details in session storage', (done) => {
    const loginContext = { username: 'testuser', password: 'password', remember: false };
    const mockTokenResponse: any = {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      token_type: 'Bearer'
    };
    const mockUserDetails: any = {
      username: 'testuser',
      userId: 1,
      authenticated: true,
      officeId: 1,
      officeName: 'Head Office',
      roles: [] as any[],
      permissions: [] as any[],
      shouldRenewPassword: false,
      isTwoFactorAuthenticationRequired: false,
      accessToken: 'mock-access-token'
    };

    service.login(loginContext).subscribe();

    const tokenReq = httpMock.expectOne('https://oauth.server.com/token');
    tokenReq.flush(mockTokenResponse);

    // Wait for the user details request
    setTimeout(() => {
      const userDetailsReq = httpMock.expectOne('https://api.server.com/userdetails');
      userDetailsReq.flush(mockUserDetails);

      // Give time for storage to be set
      setTimeout(() => {
        const storedToken = JSON.parse(sessionStorage.getItem('mifosXOAuthTokenDetails'));
        expect(storedToken.access_token).toBe('mock-access-token');
        done();
      }, 100);
    }, 100);
  });
});
