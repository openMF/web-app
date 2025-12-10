import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { ViewCollateralComponent } from './view-collateral.component';
import { ProductsService } from 'app/products/products.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { DeleteDialogComponent } from '../../../shared/delete-dialog/delete-dialog.component';
import { provideNativeDateAdapter } from '@angular/material/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import * as solidIcons from '@fortawesome/free-solid-svg-icons';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { SettingsService } from 'app/settings/settings.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ViewCollateralComponent - Integration Tests', () => {
  let component: ViewCollateralComponent;
  let fixture: ComponentFixture<ViewCollateralComponent>;
  let mockRouter: jest.Mocked<Router>;
  let mockDialog: jest.Mocked<MatDialog>;
  let mockProductsService: jest.Mocked<ProductsService>;
  let mockTranslateService: any;
  let routeDataSubject: BehaviorSubject<any>;

  const mockCollateralData: any = {
    id: 1,
    name: 'Gold Collateral',
    quality: 'High Quality',
    basePrice: 50000,
    pctToBase: 80,
    currency: {
      code: 'USD',
      name: 'US Dollar',
      displaySymbol: '$'
    },
    unitType: 'kg'
  };

  beforeEach(async () => {
    mockRouter = {
      navigate: jest.fn()
    } as any;

    mockDialog = {
      open: jest.fn()
    } as any;

    mockProductsService = {
      deleteCollateral: jest.fn()
    } as any;

    mockTranslateService = {
      instant: jest.fn((key: string) => key),
      get: jest.fn((key: string) => of(key)),
      onLangChange: of({ lang: 'en' }),
      onTranslationChange: of({}),
      onDefaultLangChange: of({ lang: 'en' })
    };

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
      dateFormat: 'dd MMMM yyyy'
    };

    routeDataSubject = new BehaviorSubject({
      collateral: { ...mockCollateralData }
    });

    await TestBed.configureTestingModule({
      imports: [
        ViewCollateralComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: MatDialog, useValue: mockDialog },
        { provide: ProductsService, useValue: mockProductsService },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: AuthenticationService, useValue: mockAuthenticationService },
        { provide: SettingsService, useValue: mockSettingsService },
        {
          provide: ActivatedRoute,
          useValue: {
            data: routeDataSubject.asObservable(),
            snapshot: { data: routeDataSubject.value }
          }
        },
        provideNativeDateAdapter(),
        provideAnimationsAsync()
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    // Add all FontAwesome solid icons to handle all child component icon requirements
    const faIconLibrary = TestBed.inject(FaIconLibrary);
    const iconList = Object.keys(solidIcons)
      .filter((key) => key !== 'fas' && key !== 'prefix' && key.startsWith('fa'))
      .map((icon) => (solidIcons as any)[icon]);
    faIconLibrary.addIcons(...iconList);

    fixture = TestBed.createComponent(ViewCollateralComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should load collateral data from route resolver', () => {
      fixture.detectChanges();
      expect(component.collateralData).toEqual(mockCollateralData);
    });

    it('should subscribe to route data on initialization', () => {
      expect(component.collateralData).toBeDefined();
      expect(component.collateralData.id).toBe(1);
      expect(component.collateralData.name).toBe('Gold Collateral');
    });

    it('should handle collateral data with all properties', () => {
      fixture.detectChanges();
      expect(component.collateralData.basePrice).toBe(50000);
      expect(component.collateralData.pctToBase).toBe(80);
      expect(component.collateralData.unitType).toBe('kg');
    });
  });

  describe('Route Data Subscription', () => {
    it('should update collateral data when route data changes', () => {
      const updatedCollateralData = {
        id: 2,
        name: 'Silver Collateral',
        quality: 'Medium Quality',
        basePrice: 30000
      };

      routeDataSubject.next({ collateral: updatedCollateralData });

      expect(component.collateralData).toEqual(updatedCollateralData);
      expect(component.collateralData.name).toBe('Silver Collateral');
      expect(component.collateralData.basePrice).toBe(30000);
    });

    it('should handle multiple route data updates', () => {
      const firstUpdate = {
        id: 2,
        name: 'First Collateral',
        basePrice: 20000
      };

      const secondUpdate = {
        id: 3,
        name: 'Second Collateral',
        basePrice: 30000
      };

      routeDataSubject.next({ collateral: firstUpdate });
      expect(component.collateralData.name).toBe('First Collateral');

      routeDataSubject.next({ collateral: secondUpdate });
      expect(component.collateralData.name).toBe('Second Collateral');
    });

    it('should maintain subscription throughout component lifecycle', () => {
      fixture.detectChanges();
      const initialData = component.collateralData;
      expect(initialData).toBeDefined();

      const newData = {
        id: 99,
        name: 'Updated Collateral',
        basePrice: 75000
      };

      routeDataSubject.next({ collateral: newData });
      expect(component.collateralData).toEqual(newData);
      expect(component.collateralData).not.toEqual(initialData);
    });
  });

  describe('Collateral Data Properties', () => {
    it('should correctly handle collateral with id', () => {
      fixture.detectChanges();
      expect(component.collateralData.id).toBe(1);
    });

    it('should correctly handle collateral name', () => {
      fixture.detectChanges();
      expect(component.collateralData.name).toBe('Gold Collateral');
      expect(typeof component.collateralData.name).toBe('string');
    });

    it('should correctly handle collateral quality', () => {
      fixture.detectChanges();
      expect(component.collateralData.quality).toBe('High Quality');
    });

    it('should correctly handle base price', () => {
      fixture.detectChanges();
      expect(component.collateralData.basePrice).toBe(50000);
      expect(typeof component.collateralData.basePrice).toBe('number');
    });

    it('should correctly handle percentage to base', () => {
      fixture.detectChanges();
      expect(component.collateralData.pctToBase).toBe(80);
    });

    it('should correctly handle currency information', () => {
      fixture.detectChanges();
      expect(component.collateralData.currency).toBeDefined();
      expect(component.collateralData.currency.code).toBe('USD');
      expect(component.collateralData.currency.name).toBe('US Dollar');
      expect(component.collateralData.currency.displaySymbol).toBe('$');
    });

    it('should correctly handle unit type', () => {
      fixture.detectChanges();
      expect(component.collateralData.unitType).toBe('kg');
    });

    it('should correctly handle nested currency object', () => {
      fixture.detectChanges();
      expect(component.collateralData.currency).toBeDefined();
      expect(component.collateralData.currency.code).toBe('USD');
    });
  });

  describe('Delete Collateral Functionality', () => {
    let mockDialogRef: jest.Mocked<MatDialogRef<DeleteDialogComponent>>;

    beforeEach(() => {
      mockDialogRef = {
        afterClosed: jest.fn()
      } as any;

      mockDialog.open.mockReturnValue(mockDialogRef);
      mockDialogRef.afterClosed.mockReturnValue(of({ delete: false }));
      fixture.detectChanges();
    });

    it('should open delete dialog when deleteCollateral is called', () => {
      component.deleteCollateral();

      expect(mockDialog.open).toHaveBeenCalledWith(
        DeleteDialogComponent,
        expect.objectContaining({
          data: expect.objectContaining({
            deleteContext: expect.any(String)
          })
        })
      );
    });

    it('should pass correct delete context to dialog', () => {
      mockTranslateService.instant.mockReturnValue('Collateral');
      component.deleteCollateral();

      expect(mockDialog.open).toHaveBeenCalledWith(
        DeleteDialogComponent,
        expect.objectContaining({
          data: {
            deleteContext: 'Collateral 1'
          }
        })
      );
    });

    it('should call translateService.instant with correct key', () => {
      component.deleteCollateral();

      expect(mockTranslateService.instant).toHaveBeenCalledWith('labels.text.Collateral');
    });

    it('should delete collateral when user confirms', () => {
      mockDialogRef.afterClosed.mockReturnValue(of({ delete: true }));
      mockProductsService.deleteCollateral.mockReturnValue(of({}));

      component.deleteCollateral();

      expect(mockProductsService.deleteCollateral).toHaveBeenCalledWith(1);
    });

    it('should NOT delete collateral when user cancels', () => {
      mockDialogRef.afterClosed.mockReturnValue(of({ delete: false }));

      component.deleteCollateral();

      expect(mockProductsService.deleteCollateral).not.toHaveBeenCalled();
    });

    it('should navigate to collaterals list after successful deletion', () => {
      mockDialogRef.afterClosed.mockReturnValue(of({ delete: true }));
      mockProductsService.deleteCollateral.mockReturnValue(of({}));

      component.deleteCollateral();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/products/collaterals']);
    });

    it('should call deleteCollateral with correct collateral id', () => {
      mockDialogRef.afterClosed.mockReturnValue(of({ delete: true }));
      mockProductsService.deleteCollateral.mockReturnValue(of({}));

      component.deleteCollateral();

      expect(mockProductsService.deleteCollateral).toHaveBeenCalledWith(mockCollateralData.id);
    });

    it('should handle dialog close without response', () => {
      mockDialogRef.afterClosed.mockReturnValue(of({}));

      expect(() => {
        component.deleteCollateral();
      }).not.toThrow();
    });

    it('should handle undefined dialog response', () => {
      mockDialogRef.afterClosed.mockReturnValue(of(undefined));

      component.deleteCollateral();

      expect(mockProductsService.deleteCollateral).not.toHaveBeenCalled();
    });

    it('should handle null dialog response', () => {
      mockDialogRef.afterClosed.mockReturnValue(of(null));

      component.deleteCollateral();

      expect(mockProductsService.deleteCollateral).not.toHaveBeenCalled();
    });

    it('should handle delete response with false flag', () => {
      mockDialogRef.afterClosed.mockReturnValue(of({ delete: false }));

      component.deleteCollateral();

      expect(mockProductsService.deleteCollateral).not.toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Delete Error Handling', () => {
    let mockDialogRef: jest.Mocked<MatDialogRef<DeleteDialogComponent>>;

    beforeEach(() => {
      mockDialogRef = {
        afterClosed: jest.fn()
      } as any;

      mockDialog.open.mockReturnValue(mockDialogRef);
      fixture.detectChanges();
    });

    it('should handle API error during deletion', () => {
      mockDialogRef.afterClosed.mockReturnValue(of({ delete: true }));
      mockProductsService.deleteCollateral.mockReturnValue(throwError(() => new Error('API Error')));

      expect(() => {
        component.deleteCollateral();
      }).not.toThrow();
    });

    it('should handle network error during deletion', () => {
      mockDialogRef.afterClosed.mockReturnValue(of({ delete: true }));
      mockProductsService.deleteCollateral.mockReturnValue(throwError(() => ({ status: 0, message: 'Network Error' })));

      component.deleteCollateral();

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should handle 404 error during deletion', () => {
      mockDialogRef.afterClosed.mockReturnValue(of({ delete: true }));
      mockProductsService.deleteCollateral.mockReturnValue(throwError(() => ({ status: 404, message: 'Not Found' })));

      component.deleteCollateral();

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should handle 500 error during deletion', () => {
      mockDialogRef.afterClosed.mockReturnValue(of({ delete: true }));
      mockProductsService.deleteCollateral.mockReturnValue(
        throwError(() => ({ status: 500, message: 'Server Error' }))
      );

      component.deleteCollateral();

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should handle deletion service unavailable', () => {
      mockDialogRef.afterClosed.mockReturnValue(of({ delete: true }));
      mockProductsService.deleteCollateral.mockReturnValue(
        throwError(() => ({ status: 503, message: 'Service Unavailable' }))
      );

      expect(() => {
        component.deleteCollateral();
      }).not.toThrow();
    });
  });

  describe('Translation Service Integration', () => {
    let mockDialogRef: jest.Mocked<MatDialogRef<DeleteDialogComponent>>;

    beforeEach(() => {
      mockDialogRef = {
        afterClosed: jest.fn().mockReturnValue(of({ delete: false }))
      } as any;

      mockDialog.open.mockReturnValue(mockDialogRef);
      fixture.detectChanges();
    });

    it('should translate delete context label', () => {
      mockTranslateService.instant.mockReturnValue('Garantía');
      component.deleteCollateral();

      const callArgs = mockDialog.open.mock.calls[0][1] as any;
      expect(callArgs.data.deleteContext).toContain('Garantía');
    });

    it('should handle translation service returning empty string', () => {
      mockTranslateService.instant.mockReturnValue('');
      component.deleteCollateral();

      const callArgs = mockDialog.open.mock.calls[0][1] as any;
      expect(callArgs.data.deleteContext).toBe(' 1');
    });

    it('should handle translation service returning undefined', () => {
      mockTranslateService.instant.mockReturnValue(undefined as any);
      component.deleteCollateral();

      const callArgs = mockDialog.open.mock.calls[0][1] as any;
      expect(callArgs.data.deleteContext).toContain('1');
    });

    it('should concatenate translation with collateral id', () => {
      mockTranslateService.instant.mockReturnValue('Collateral');
      component.deleteCollateral();

      const callArgs = mockDialog.open.mock.calls[0][1] as any;
      expect(callArgs.data.deleteContext).toBe('Collateral 1');
    });

    it('should handle different language translations', () => {
      const translations = [
        'Collateral',
        'Garantía',
        'Sicherheit',
        '担保'
      ];

      translations.forEach((translation) => {
        mockTranslateService.instant.mockReturnValue(translation);
        component.deleteCollateral();

        const callArgs = mockDialog.open.mock.calls[mockDialog.open.mock.calls.length - 1][1] as any;
        expect(callArgs.data.deleteContext).toContain(translation);
      });
    });
  });

  describe('Router Navigation', () => {
    let mockDialogRef: jest.Mocked<MatDialogRef<DeleteDialogComponent>>;

    beforeEach(() => {
      mockDialogRef = {
        afterClosed: jest.fn()
      } as any;

      mockDialog.open.mockReturnValue(mockDialogRef);
      fixture.detectChanges();
    });

    it('should navigate to correct route after deletion', () => {
      mockDialogRef.afterClosed.mockReturnValue(of({ delete: true }));
      mockProductsService.deleteCollateral.mockReturnValue(of({}));

      component.deleteCollateral();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/products/collaterals']);
    });

    it('should navigate with correct path array', () => {
      mockDialogRef.afterClosed.mockReturnValue(of({ delete: true }));
      mockProductsService.deleteCollateral.mockReturnValue(of({}));

      component.deleteCollateral();

      const navArgs = mockRouter.navigate.mock.calls[0][0];
      expect(Array.isArray(navArgs)).toBe(true);
      expect(navArgs).toEqual(['/products/collaterals']);
    });

    it('should only navigate after successful deletion', () => {
      mockDialogRef.afterClosed.mockReturnValue(of({ delete: true }));
      mockProductsService.deleteCollateral.mockReturnValue(of({}));

      component.deleteCollateral();

      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
    });

    it('should not navigate if deletion fails', () => {
      mockDialogRef.afterClosed.mockReturnValue(of({ delete: true }));
      mockProductsService.deleteCollateral.mockReturnValue(throwError(() => new Error('Delete failed')));

      component.deleteCollateral();

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should not navigate if user cancels', () => {
      mockDialogRef.afterClosed.mockReturnValue(of({ delete: false }));

      component.deleteCollateral();

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle collateral data with minimal properties', () => {
      const minimalCollateral = {
        id: 1,
        name: 'Simple Collateral'
      };

      routeDataSubject.next({ collateral: minimalCollateral });
      expect(component.collateralData).toEqual(minimalCollateral);
      expect(component.collateralData.name).toBe('Simple Collateral');
    });

    it('should handle collateral data with zero base price', () => {
      const zeroPrice = {
        id: 1,
        name: 'Zero Price',
        basePrice: 0
      };

      routeDataSubject.next({ collateral: zeroPrice });
      expect(component.collateralData.basePrice).toBe(0);
    });

    it('should handle collateral data with high base price', () => {
      const highPrice = {
        id: 1,
        name: 'High Price',
        basePrice: 999999999
      };

      routeDataSubject.next({ collateral: highPrice });
      expect(component.collateralData.basePrice).toBe(999999999);
    });

    it('should handle collateral with null currency', () => {
      const nullCurrency: any = {
        id: 1,
        name: 'No Currency',
        basePrice: 10000,
        currency: null
      };

      routeDataSubject.next({ collateral: nullCurrency });
      expect(component.collateralData.currency).toBeNull();
    });

    it('should handle collateral with undefined properties', () => {
      const undefinedProps: any = {
        id: 1,
        name: 'Collateral',
        basePrice: undefined,
        quality: undefined
      };

      routeDataSubject.next({ collateral: undefinedProps });
      expect(component.collateralData.basePrice).toBeUndefined();
      expect(component.collateralData.quality).toBeUndefined();
    });

    it('should handle empty collateral data object', () => {
      const emptyData = {};

      routeDataSubject.next({ collateral: emptyData });
      expect(component.collateralData).toEqual(emptyData);
    });

    it('should handle collateral with special characters in name', () => {
      const specialChars = {
        id: 1,
        name: 'Collateral & Assets @ 100%',
        basePrice: 15000
      };

      routeDataSubject.next({ collateral: specialChars });
      expect(component.collateralData.name).toBe('Collateral & Assets @ 100%');
    });

    it('should handle collateral with very long name', () => {
      const longName = 'A'.repeat(200);
      const longNameCollateral = {
        id: 1,
        name: longName,
        basePrice: 10000
      };

      routeDataSubject.next({ collateral: longNameCollateral });
      expect(component.collateralData.name).toBe(longName);
      expect(component.collateralData.name.length).toBe(200);
    });

    it('should handle collateral with negative id', () => {
      const negativeId = {
        id: -1,
        name: 'Invalid Collateral',
        basePrice: 10000
      };

      routeDataSubject.next({ collateral: negativeId });
      expect(component.collateralData.id).toBe(-1);
    });

    it('should handle collateral with negative base price', () => {
      const negativePrice = {
        id: 1,
        name: 'Negative Price',
        basePrice: -5000
      };

      routeDataSubject.next({ collateral: negativePrice });
      expect(component.collateralData.basePrice).toBe(-5000);
    });
  });

  describe('Component Rendering', () => {
    it('should render component without errors when data is provided', () => {
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should update view when collateral data changes', () => {
      fixture.detectChanges();
      const initialName = component.collateralData.name;

      const newData = {
        id: 2,
        name: 'Updated Collateral Name',
        basePrice: 25000
      };

      routeDataSubject.next({ collateral: newData });
      fixture.detectChanges();

      expect(component.collateralData.name).not.toBe(initialName);
      expect(component.collateralData.name).toBe('Updated Collateral Name');
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
        expect(data.collateral).toBeDefined();
      });

      expect(dataEmitted).toBe(true);
    });

    it('should handle route snapshot data', () => {
      const activatedRoute = TestBed.inject(ActivatedRoute);
      expect(activatedRoute.snapshot.data.collateral).toBeDefined();
      expect(activatedRoute.snapshot.data.collateral).toEqual(mockCollateralData);
    });
  });

  describe('Complete Collateral View Workflow', () => {
    it('should complete full view workflow', () => {
      // 1. Component initializes
      fixture.detectChanges();
      expect(component).toBeTruthy();

      // 2. Collateral data is loaded
      expect(component.collateralData).toBeDefined();
      expect(component.collateralData.id).toBe(1);

      // 3. Data is correctly populated
      expect(component.collateralData.name).toBe('Gold Collateral');
      expect(component.collateralData.basePrice).toBe(50000);
      expect(component.collateralData.pctToBase).toBe(80);

      // 4. Component can handle data updates
      const updatedData = {
        id: 1,
        name: 'Updated Gold',
        basePrice: 55000
      };

      routeDataSubject.next({ collateral: updatedData });
      expect(component.collateralData.name).toBe('Updated Gold');
      expect(component.collateralData.basePrice).toBe(55000);
    });

    it('should complete full delete workflow', () => {
      const mockDialogRef = {
        afterClosed: jest.fn().mockReturnValue(of({ delete: true }))
      } as any;

      mockDialog.open.mockReturnValue(mockDialogRef);
      mockProductsService.deleteCollateral.mockReturnValue(of({}));

      fixture.detectChanges();

      // Execute delete
      component.deleteCollateral();

      // Verify workflow
      expect(mockDialog.open).toHaveBeenCalled();
      expect(mockProductsService.deleteCollateral).toHaveBeenCalledWith(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/products/collaterals']);
    });

    it('should maintain data integrity throughout component lifecycle', () => {
      // Initial state
      fixture.detectChanges();
      const initialId = component.collateralData.id;

      // Multiple updates
      for (let i = 1; i <= 5; i++) {
        const newData = {
          id: initialId,
          name: `Collateral Update ${i}`,
          basePrice: 10000 + i * 1000
        };
        routeDataSubject.next({ collateral: newData });
        expect(component.collateralData.name).toBe(`Collateral Update ${i}`);
        expect(component.collateralData.basePrice).toBe(10000 + i * 1000);
      }

      // Final state verification
      expect(component.collateralData.id).toBe(initialId);
    });
  });

  describe('Data Type Validation', () => {
    it('should handle collateral with all string values', () => {
      const stringValues = {
        id: '1',
        name: 'String Collateral',
        basePrice: '50000',
        pctToBase: '80'
      };

      routeDataSubject.next({ collateral: stringValues });
      expect(component.collateralData.id).toBe('1');
      expect(component.collateralData.basePrice).toBe('50000');
    });

    it('should handle collateral with mixed data types', () => {
      const mixedTypes = {
        id: 1,
        name: 'Mixed Collateral',
        basePrice: '50000',
        isActive: true,
        pctToBase: 80
      };

      routeDataSubject.next({ collateral: mixedTypes });
      expect(component.collateralData.isActive).toBe(true);
      expect(typeof component.collateralData.id).toBe('number');
    });

    it('should handle collateral with nested objects', () => {
      const nestedObjects = {
        id: 1,
        name: 'Nested Collateral',
        currency: {
          code: 'USD',
          name: 'US Dollar',
          details: {
            symbol: '$',
            locale: 'en-US'
          }
        }
      };

      routeDataSubject.next({ collateral: nestedObjects });
      expect(component.collateralData.currency.details).toBeDefined();
      expect(component.collateralData.currency.details.symbol).toBe('$');
    });
  });

  describe('Memory and Performance', () => {
    it('should not create memory leaks with multiple updates', () => {
      fixture.detectChanges();

      for (let i = 0; i < 100; i++) {
        const newData = {
          id: i,
          name: `Collateral ${i}`,
          basePrice: i * 1000
        };
        routeDataSubject.next({ collateral: newData });
      }

      expect(component.collateralData.id).toBe(99);
      expect(component.collateralData.name).toBe('Collateral 99');
    });

    it('should handle rapid consecutive updates', () => {
      fixture.detectChanges();

      const updates = [
        { id: 1, name: 'Collateral 1' },
        { id: 2, name: 'Collateral 2' },
        { id: 3, name: 'Collateral 3' }
      ];

      updates.forEach((update) => {
        routeDataSubject.next({ collateral: update });
      });

      expect(component.collateralData.name).toBe('Collateral 3');
    });

    it('should handle component with large collateral data', () => {
      const largeData = {
        ...mockCollateralData,
        additionalData: new Array(1000).fill({ key: 'value' })
      };

      routeDataSubject.next({ collateral: largeData });
      fixture.detectChanges();

      expect(component.collateralData.additionalData.length).toBe(1000);
    });
  });

  describe('Dialog Management', () => {
    it('should open MatDialog with DeleteDialogComponent', () => {
      const mockDialogRef = {
        afterClosed: jest.fn().mockReturnValue(of({ delete: false }))
      } as any;

      mockDialog.open.mockReturnValue(mockDialogRef);
      fixture.detectChanges();

      component.deleteCollateral();

      expect(mockDialog.open).toHaveBeenCalledWith(DeleteDialogComponent, expect.any(Object));
    });

    it('should pass dialog configuration', () => {
      const mockDialogRef = {
        afterClosed: jest.fn().mockReturnValue(of({ delete: false }))
      } as any;

      mockDialog.open.mockReturnValue(mockDialogRef);
      fixture.detectChanges();

      component.deleteCollateral();

      const config = mockDialog.open.mock.calls[0][1];
      expect(config).toBeDefined();
      expect(config.data).toBeDefined();
    });

    it('should subscribe to dialog afterClosed', () => {
      const mockDialogRef = {
        afterClosed: jest.fn().mockReturnValue(of({ delete: false }))
      } as any;

      mockDialog.open.mockReturnValue(mockDialogRef);
      fixture.detectChanges();

      component.deleteCollateral();

      expect(mockDialogRef.afterClosed).toHaveBeenCalled();
    });

    it('should handle dialog opening multiple times', () => {
      const mockDialogRef = {
        afterClosed: jest.fn().mockReturnValue(of({ delete: false }))
      } as any;

      mockDialog.open.mockReturnValue(mockDialogRef);
      fixture.detectChanges();

      component.deleteCollateral();
      component.deleteCollateral();
      component.deleteCollateral();

      expect(mockDialog.open).toHaveBeenCalledTimes(3);
    });
  });
});
