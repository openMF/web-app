/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { ProductsComponent } from './products.component';
import { InvestmentAccessService } from './investment-products/investment-access.service';
import { ConfigurationWizardService } from '../configuration-wizard/configuration-wizard.service';
import { PopoverService } from '../configuration-wizard/popover/popover.service';
import { AuthenticationService } from '../core/authentication/authentication.service';

describe('ProductsComponent', () => {
  let component: ProductsComponent;
  let fixture: ComponentFixture<ProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProductsComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        {
          provide: AuthenticationService,
          useValue: {
            getCredentials: () => ({ permissions: ['ALL_FUNCTIONS'], userId: 1 })
          }
        },
        {
          provide: InvestmentAccessService,
          useValue: { has: () => true, userId: 1 }
        },
        {
          provide: ConfigurationWizardService,
          useValue: {
            showCharges: false,
            showLoanProducts: false,
            showSavingsProducts: false,
            showShareProducts: false,
            showFixedDepositProducts: false,
            showRecurringDepositProducts: false
          }
        },
        {
          provide: PopoverService,
          useValue: { open: jest.fn() }
        }
      ]
    }).compileComponents();

    TestBed.inject(FaIconLibrary).addIconPacks(fas);

    fixture = TestBed.createComponent(ProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize arrowBooleans with 14 false values', () => {
    expect(component.arrowBooleans.length).toBe(14);
    expect(component.arrowBooleans.every((val) => val === false)).toBe(true);
  });

  it('should toggle boolean at specified index with arrowBooleansToggle', () => {
    expect(component.arrowBooleans[1]).toBe(false);
    component.arrowBooleansToggle(1);
    expect(component.arrowBooleans[1]).toBe(true);
    component.arrowBooleansToggle(1);
    expect(component.arrowBooleans[1]).toBe(false);
  });

  it('should toggle charges row index (1) when clicking charges arrow icon', () => {
    const chargesArrow = component.charges.nativeElement.querySelector('.menu-right-section fa-icon');
    expect(chargesArrow).toBeTruthy();

    expect(component.arrowBooleans[1]).toBe(false);
    expect(component.arrowBooleans[3]).toBe(false);

    chargesArrow.click();
    fixture.detectChanges();

    expect(component.arrowBooleans[1]).toBe(true);
    expect(component.arrowBooleans[3]).toBe(false);
  });

  it('should toggle savings products row index (6) when clicking savings products arrow icon', () => {
    const savingsArrow = component.savingsProducts.nativeElement.querySelector('.menu-right-section fa-icon');
    expect(savingsArrow).toBeTruthy();

    expect(component.arrowBooleans[6]).toBe(false);
    expect(component.arrowBooleans[1]).toBe(false);

    savingsArrow.click();
    fixture.detectChanges();

    expect(component.arrowBooleans[6]).toBe(true);
    expect(component.arrowBooleans[1]).toBe(false);
  });

  it('should toggle share products row index (9) when clicking share products arrow icon', () => {
    const shareArrow = component.shareProducts.nativeElement.querySelector('.menu-right-section fa-icon');
    expect(shareArrow).toBeTruthy();

    expect(component.arrowBooleans[9]).toBe(false);
    expect(component.arrowBooleans[2]).toBe(false);

    shareArrow.click();
    fixture.detectChanges();

    expect(component.arrowBooleans[9]).toBe(true);
    expect(component.arrowBooleans[2]).toBe(false);
  });
});
