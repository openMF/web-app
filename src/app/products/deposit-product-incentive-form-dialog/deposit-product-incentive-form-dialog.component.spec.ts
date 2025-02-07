import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DepositProductIncentiveFormDialogComponent } from './deposit-product-incentive-form-dialog.component';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

describe('DepositProductIncentiveFormDialogComponent', () => {
  let component: DepositProductIncentiveFormDialogComponent;
  let fixture: ComponentFixture<DepositProductIncentiveFormDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DepositProductIncentiveFormDialogComponent],
      imports: [MatDialogModule],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DepositProductIncentiveFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
