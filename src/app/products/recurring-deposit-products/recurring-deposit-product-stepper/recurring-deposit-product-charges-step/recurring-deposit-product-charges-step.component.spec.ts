import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurringDepositProductChargesStepComponent } from './recurring-deposit-product-charges-step.component';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('RecurringDepositProductChargesStepComponent', () => {
  let component: RecurringDepositProductChargesStepComponent;
  let fixture: ComponentFixture<RecurringDepositProductChargesStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RecurringDepositProductChargesStepComponent],
      imports: [
        MatDialogModule,
        TranslateModule
      ],
      providers: [
        TranslateService,
        { provide: MatDialogRef, useValue: {} }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurringDepositProductChargesStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
