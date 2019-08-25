import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DepositProductIncentiveFormDialogComponent } from './deposit-product-incentive-form-dialog.component';

describe('DepositProductIncentiveFormDialogComponent', () => {
  let component: DepositProductIncentiveFormDialogComponent;
  let fixture: ComponentFixture<DepositProductIncentiveFormDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DepositProductIncentiveFormDialogComponent ]
    })
    .compileComponents();
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
