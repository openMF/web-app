import { UrlToStringPipe } from './url-to-string.pipe';

describe('UrlToStringPipe', () => {
  let pipe: UrlToStringPipe;

  beforeEach(() => {
    pipe = new UrlToStringPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  describe('URL Transformations', () => {
    it('should transform single-segment URL', () => {
      expect(pipe.transform('/users')).toBe('Users');
    });

    it('should transform multi-segment URL with pipe separators', () => {
      expect(pipe.transform('/admin/system/configuration')).toBe('Admin | System | Configuration');
    });

    it('should capitalize first letter of each word', () => {
      expect(pipe.transform('/dashboard')).toBe('Dashboard');
    });

    it('should transform hyphenated segments into space-separated words', () => {
      expect(pipe.transform('/user-management')).toBe('User Management');
    });

    it('should handle multiple hyphens in single segment', () => {
      expect(pipe.transform('/loan-product-details')).toBe('Loan Product Details');
    });

    it('should handle hyphens in multiple segments', () => {
      expect(pipe.transform('/client-accounts/savings-accounts')).toBe('Client Accounts | Savings Accounts');
    });

    it('should remove query parameters from URL', () => {
      expect(pipe.transform('/users?id=123')).toBe('Users');
    });

    it('should handle query parameters in multi-segment URLs', () => {
      expect(pipe.transform('/clients/details?clientId=456')).toBe('Clients | Details');
    });

    it('should handle multiple query parameters', () => {
      expect(pipe.transform('/reports/view?type=loan&status=active')).toBe('Reports | View');
    });

    it('should decode URL-encoded spaces', () => {
      expect(pipe.transform('/users%20management')).toBe('Users management');
    });

    it('should decode URL-encoded special characters', () => {
      expect(pipe.transform('/client%20%26%20accounts')).toBe('Client & accounts');
    });

    it('should handle URL with only leading slash', () => {
      expect(pipe.transform('/')).toBe('');
    });

    it('should handle URL with trailing slash', () => {
      expect(pipe.transform('/users/')).toBe('Users | ');
    });

    it('should handle empty segments', () => {
      expect(pipe.transform('/users//accounts')).toBe('Users |  | Accounts');
    });

    it('should handle single character segments', () => {
      expect(pipe.transform('/a/b/c')).toBe('A | B | C');
    });

    it('should handle numeric segments', () => {
      expect(pipe.transform('/client/123/accounts')).toBe('Client | 123 | Accounts');
    });

    it('should handle mixed case input', () => {
      expect(pipe.transform('/UserManagement/ClientAccounts')).toBe('UserManagement | ClientAccounts');
    });

    it('should handle uppercase input', () => {
      expect(pipe.transform('/API/Settings')).toBe('API | Settings');
    });
  });

  describe('Real-World Usage', () => {
    it('should transform navigation breadcrumb URL', () => {
      expect(pipe.transform('/clients/view-client/general')).toBe('Clients | View Client | General');
    });

    it('should transform settings page URL', () => {
      expect(pipe.transform('/system/manage-data-tables')).toBe('System | Manage Data Tables');
    });

    it('should transform report URL with query params', () => {
      expect(pipe.transform('/reports/run-report?reportId=5')).toBe('Reports | Run Report');
    });

    it('should transform user profile edit URL', () => {
      expect(pipe.transform('/users/edit-user/123')).toBe('Users | Edit User | 123');
    });

    it('should transform deep nested URL', () => {
      expect(pipe.transform('/products/loan-products/edit-loan-product/details')).toBe(
        'Products | Loan Products | Edit Loan Product | Details'
      );
    });
  });
});
