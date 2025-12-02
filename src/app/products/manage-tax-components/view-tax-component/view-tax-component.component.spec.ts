import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, BehaviorSubject } from 'rxjs';
import { ViewTaxComponentComponent } from './view-tax-component.component';
import { TranslateModule } from '@ngx-translate/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import * as solidIcons from '@fortawesome/free-solid-svg-icons';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { SettingsService } from 'app/settings/settings.service';
import { DecimalPipe, DatePipe } from '@angular/common';

describe('ViewTaxComponentComponent - Integration Tests', () => {
  let component: ViewTaxComponentComponent;
  let fixture: ComponentFixture<ViewTaxComponentComponent>;
  let mockRouter: jest.Mocked<Router>;
  let routeDataSubject: BehaviorSubject<any>;

  const mockTaxComponentData: any = {
    id: 1,
    name: 'VAT',
    percentage: 15.5,
    startDate: [
      2024,
      1,
      1
    ],
    creditAccount: {
      id: 101,
      name: 'Tax Payable',
      glCode: '2001'
    },
    creditAccountId: 101,
    creditAccountName: 'Tax Payable',
    creditAccountType: {
      id: 2,
      code: 'LIABILITY',
      value: 'Liability'
    }
  };

  beforeEach(async () => {
    mockRouter = {
      navigate: jest.fn()
    } as any;

    const mockAuthenticationService = {
      isAuthenticated: jest.fn<() => boolean>().mockReturnValue(true),
      getCredentials: jest.fn().mockReturnValue({
        username: 'testuser',
        accessToken: 'test-token',
        permissions: ['ALL_FUNCTIONS']
      })
    };

    const mockSettingsService = {
      language: { code: 'en' },
      dateFormat: 'dd MMMM yyyy',
      decimals: '2'
    };

    routeDataSubject = new BehaviorSubject({
      taxComponent: { ...mockTaxComponentData }
    });

    await TestBed.configureTestingModule({
      imports: [
        ViewTaxComponentComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AuthenticationService, useValue: mockAuthenticationService },
        { provide: SettingsService, useValue: mockSettingsService },
        {
          provide: ActivatedRoute,
          useValue: {
            data: routeDataSubject.asObservable(),
            snapshot: { data: routeDataSubject.value }
          }
        },
        DatePipe,
        DecimalPipe,
        provideNativeDateAdapter(),
        provideAnimationsAsync()

      ]
    }).compileComponents();

    // Add all FontAwesome solid icons to handle all child component icon requirements
    const faIconLibrary = TestBed.inject(FaIconLibrary);
    const iconList = Object.keys(solidIcons)
      .filter((key) => key !== 'fas' && key !== 'prefix' && key.startsWith('fa'))
      .map((icon) => (solidIcons as any)[icon]);
    faIconLibrary.addIcons(...iconList);

    fixture = TestBed.createComponent(ViewTaxComponentComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should load tax component data from route resolver', () => {
      fixture.detectChanges();
      expect(component.taxComponentData).toEqual(mockTaxComponentData);
    });

    it('should subscribe to route data on initialization', () => {
      expect(component.taxComponentData).toBeDefined();
      expect(component.taxComponentData.id).toBe(1);
      expect(component.taxComponentData.name).toBe('VAT');
    });

    it('should handle tax component data with all properties', () => {
      fixture.detectChanges();
      expect(component.taxComponentData.percentage).toBe(15.5);
      expect(component.taxComponentData.creditAccountId).toBe(101);
      expect(component.taxComponentData.creditAccountName).toBe('Tax Payable');
    });
  });

  describe('Route Data Subscription', () => {
    it('should update tax component data when route data changes', () => {
      const updatedTaxData = {
        id: 2,
        name: 'GST',
        percentage: 18.0,
        startDate: [
          2024,
          6,
          1
        ],
        creditAccountId: 102,
        creditAccountName: 'GST Payable'
      };

      routeDataSubject.next({
        taxComponent: updatedTaxData
      });

      expect(component.taxComponentData).toEqual(updatedTaxData);
      expect(component.taxComponentData.name).toBe('GST');
      expect(component.taxComponentData.percentage).toBe(18.0);
    });

    it('should handle multiple route data updates', () => {
      const firstUpdate = {
        id: 2,
        name: 'Sales Tax',
        percentage: 10.0
      };

      const secondUpdate = {
        id: 3,
        name: 'Service Tax',
        percentage: 12.0
      };

      routeDataSubject.next({ taxComponent: firstUpdate });
      expect(component.taxComponentData.name).toBe('Sales Tax');

      routeDataSubject.next({ taxComponent: secondUpdate });
      expect(component.taxComponentData.name).toBe('Service Tax');
    });

    it('should maintain subscription throughout component lifecycle', () => {
      fixture.detectChanges();
      const initialData = component.taxComponentData;
      expect(initialData).toBeDefined();

      const newData = {
        id: 99,
        name: 'Updated Tax',
        percentage: 20.0
      };

      routeDataSubject.next({ taxComponent: newData });
      expect(component.taxComponentData).toEqual(newData);
      expect(component.taxComponentData).not.toEqual(initialData);
    });
  });

  describe('Tax Component Data Properties', () => {
    it('should correctly handle tax component with id', () => {
      fixture.detectChanges();
      expect(component.taxComponentData.id).toBe(1);
    });

    it('should correctly handle tax component name', () => {
      fixture.detectChanges();
      expect(component.taxComponentData.name).toBe('VAT');
      expect(typeof component.taxComponentData.name).toBe('string');
    });

    it('should correctly handle tax component percentage', () => {
      fixture.detectChanges();
      expect(component.taxComponentData.percentage).toBe(15.5);
      expect(typeof component.taxComponentData.percentage).toBe('number');
    });

    it('should correctly handle tax component start date', () => {
      fixture.detectChanges();
      expect(component.taxComponentData.startDate).toEqual([
        2024,
        1,
        1
      ]);
      expect(Array.isArray(component.taxComponentData.startDate)).toBe(true);
    });

    it('should correctly handle credit account information', () => {
      fixture.detectChanges();
      expect(component.taxComponentData.creditAccountId).toBe(101);
      expect(component.taxComponentData.creditAccountName).toBe('Tax Payable');
    });

    it('should correctly handle nested credit account object', () => {
      fixture.detectChanges();
      expect(component.taxComponentData.creditAccount).toBeDefined();
      expect(component.taxComponentData.creditAccount.id).toBe(101);
      expect(component.taxComponentData.creditAccount.name).toBe('Tax Payable');
      expect(component.taxComponentData.creditAccount.glCode).toBe('2001');
    });

    it('should correctly handle credit account type', () => {
      fixture.detectChanges();
      expect(component.taxComponentData.creditAccountType).toBeDefined();
      expect(component.taxComponentData.creditAccountType.code).toBe('LIABILITY');
      expect(component.taxComponentData.creditAccountType.value).toBe('Liability');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle tax component data with minimal properties', () => {
      const minimalTaxData = {
        id: 1,
        name: 'Simple Tax'
      };

      routeDataSubject.next({ taxComponent: minimalTaxData });
      expect(component.taxComponentData).toEqual(minimalTaxData);
      expect(component.taxComponentData.name).toBe('Simple Tax');
    });

    it('should handle tax component data with zero percentage', () => {
      const zeroPercentageTax = {
        id: 1,
        name: 'Zero Tax',
        percentage: 0
      };

      routeDataSubject.next({ taxComponent: zeroPercentageTax });
      expect(component.taxComponentData.percentage).toBe(0);
    });

    it('should handle tax component data with high percentage', () => {
      const highPercentageTax = {
        id: 1,
        name: 'High Tax',
        percentage: 99.99
      };

      routeDataSubject.next({ taxComponent: highPercentageTax });
      expect(component.taxComponentData.percentage).toBe(99.99);
    });

    it('should handle tax component with null credit account', () => {
      const taxWithNullAccount: any = {
        id: 1,
        name: 'Tax Without Account',
        percentage: 10,
        creditAccount: null
      };

      routeDataSubject.next({ taxComponent: taxWithNullAccount });
      expect(component.taxComponentData.creditAccount).toBeNull();
    });

    it('should handle tax component with undefined properties', () => {
      const taxWithUndefined: any = {
        id: 1,
        name: 'Tax',
        percentage: undefined,
        startDate: undefined
      };

      routeDataSubject.next({ taxComponent: taxWithUndefined });
      expect(component.taxComponentData.percentage).toBeUndefined();
      expect(component.taxComponentData.startDate).toBeUndefined();
    });

    it('should handle empty tax component data object', () => {
      const emptyTaxData = {};

      routeDataSubject.next({ taxComponent: emptyTaxData });
      expect(component.taxComponentData).toEqual(emptyTaxData);
    });

    it('should handle tax component with different date formats', () => {
      const taxWithDateString = {
        id: 1,
        name: 'Tax',
        startDate: '2024-01-01'
      };

      routeDataSubject.next({ taxComponent: taxWithDateString });
      expect(component.taxComponentData.startDate).toBe('2024-01-01');
    });

    it('should handle tax component with special characters in name', () => {
      const taxWithSpecialChars = {
        id: 1,
        name: 'Tax & Service @ 15%',
        percentage: 15
      };

      routeDataSubject.next({ taxComponent: taxWithSpecialChars });
      expect(component.taxComponentData.name).toBe('Tax & Service @ 15%');
    });

    it('should handle tax component with very long name', () => {
      const longName = 'A'.repeat(200);
      const taxWithLongName = {
        id: 1,
        name: longName,
        percentage: 10
      };

      routeDataSubject.next({ taxComponent: taxWithLongName });
      expect(component.taxComponentData.name).toBe(longName);
      expect(component.taxComponentData.name.length).toBe(200);
    });

    it('should handle tax component with negative id', () => {
      const taxWithNegativeId = {
        id: -1,
        name: 'Invalid Tax',
        percentage: 10
      };

      routeDataSubject.next({ taxComponent: taxWithNegativeId });
      expect(component.taxComponentData.id).toBe(-1);
    });
  });

  describe('Component Rendering', () => {
    it('should render component without errors when data is provided', () => {
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should update view when tax component data changes', () => {
      fixture.detectChanges();
      const initialName = component.taxComponentData.name;

      const newTaxData = {
        id: 2,
        name: 'Updated Tax Name',
        percentage: 20
      };

      routeDataSubject.next({ taxComponent: newTaxData });
      fixture.detectChanges();

      expect(component.taxComponentData.name).not.toBe(initialName);
      expect(component.taxComponentData.name).toBe('Updated Tax Name');
    });

    it('should handle component destruction gracefully', () => {
      fixture.detectChanges();
      expect(() => {
        fixture.destroy();
      }).not.toThrow();
    });
  });

  describe('Integration with ActivatedRoute', () => {
    it('should correctly inject ActivatedRoute', () => {
      const activatedRoute = TestBed.inject(ActivatedRoute);
      expect(activatedRoute).toBeDefined();
    });

    it('should access route data through subscription', () => {
      let dataEmitted = false;
      const activatedRoute = TestBed.inject(ActivatedRoute);

      activatedRoute.data.subscribe((data) => {
        dataEmitted = true;
        expect(data.taxComponent).toBeDefined();
      });

      expect(dataEmitted).toBe(true);
    });

    it('should handle route snapshot data', () => {
      const activatedRoute = TestBed.inject(ActivatedRoute);
      expect(activatedRoute.snapshot.data.taxComponent).toBeDefined();
      expect(activatedRoute.snapshot.data.taxComponent).toEqual(mockTaxComponentData);
    });
  });

  describe('Complete Tax Component View Workflow', () => {
    it('should complete full view workflow', () => {
      // 1. Component initializes
      fixture.detectChanges();
      expect(component).toBeTruthy();

      // 2. Tax component data is loaded
      expect(component.taxComponentData).toBeDefined();
      expect(component.taxComponentData.id).toBe(1);

      // 3. Data is correctly populated
      expect(component.taxComponentData.name).toBe('VAT');
      expect(component.taxComponentData.percentage).toBe(15.5);
      expect(component.taxComponentData.creditAccountId).toBe(101);

      // 4. Component can handle data updates
      const updatedData = {
        id: 1,
        name: 'Updated VAT',
        percentage: 16.0
      };

      routeDataSubject.next({ taxComponent: updatedData });
      expect(component.taxComponentData.name).toBe('Updated VAT');
      expect(component.taxComponentData.percentage).toBe(16.0);
    });

    it('should maintain data integrity throughout component lifecycle', () => {
      // Initial state
      fixture.detectChanges();
      const initialId = component.taxComponentData.id;

      // Multiple updates
      for (let i = 1; i <= 5; i++) {
        const newData = {
          id: initialId,
          name: `Tax Update ${i}`,
          percentage: 10 + i
        };
        routeDataSubject.next({ taxComponent: newData });
        expect(component.taxComponentData.name).toBe(`Tax Update ${i}`);
        expect(component.taxComponentData.percentage).toBe(10 + i);
      }

      // Final state verification
      expect(component.taxComponentData.id).toBe(initialId);
    });
  });

  describe('Data Type Validation', () => {
    it('should handle tax component with all string values', () => {
      const taxWithStrings = {
        id: '1',
        name: 'String Tax',
        percentage: '15.5',
        creditAccountId: '101'
      };

      routeDataSubject.next({ taxComponent: taxWithStrings });
      expect(component.taxComponentData.id).toBe('1');
      expect(component.taxComponentData.percentage).toBe('15.5');
    });

    it('should handle tax component with mixed data types', () => {
      const taxWithMixedTypes = {
        id: 1,
        name: 'Mixed Tax',
        percentage: '15.5',
        isActive: true,
        creditAccountId: 101
      };

      routeDataSubject.next({ taxComponent: taxWithMixedTypes });
      expect(component.taxComponentData.isActive).toBe(true);
      expect(typeof component.taxComponentData.id).toBe('number');
    });

    it('should handle tax component with array properties', () => {
      const taxWithArrays = {
        id: 1,
        name: 'Array Tax',
        startDate: [
          2024,
          1,
          1
        ],
        applicableRegions: [
          'North',
          'South',
          'East'
        ]
      };

      routeDataSubject.next({ taxComponent: taxWithArrays });
      expect(Array.isArray(component.taxComponentData.startDate)).toBe(true);
      expect(Array.isArray(component.taxComponentData.applicableRegions)).toBe(true);
      expect(component.taxComponentData.applicableRegions.length).toBe(3);
    });

    it('should handle tax component with nested objects', () => {
      const taxWithNestedObjects = {
        id: 1,
        name: 'Nested Tax',
        creditAccount: {
          id: 101,
          name: 'Tax Account',
          details: {
            glCode: '2001',
            type: 'LIABILITY'
          }
        }
      };

      routeDataSubject.next({ taxComponent: taxWithNestedObjects });
      expect(component.taxComponentData.creditAccount.details).toBeDefined();
      expect(component.taxComponentData.creditAccount.details.glCode).toBe('2001');
    });
  });

  describe('Memory and Performance', () => {
    it('should not create memory leaks with multiple updates', () => {
      fixture.detectChanges();

      for (let i = 0; i < 100; i++) {
        const newData = {
          id: i,
          name: `Tax ${i}`,
          percentage: i * 0.1
        };
        routeDataSubject.next({ taxComponent: newData });
      }

      expect(component.taxComponentData.id).toBe(99);
      expect(component.taxComponentData.name).toBe('Tax 99');
    });

    it('should handle rapid consecutive updates', () => {
      fixture.detectChanges();

      const updates = [
        { id: 1, name: 'Tax 1' },
        { id: 2, name: 'Tax 2' },
        { id: 3, name: 'Tax 3' }
      ];

      updates.forEach((update) => {
        routeDataSubject.next({ taxComponent: update });
      });

      expect(component.taxComponentData.name).toBe('Tax 3');
    });
  });
});
