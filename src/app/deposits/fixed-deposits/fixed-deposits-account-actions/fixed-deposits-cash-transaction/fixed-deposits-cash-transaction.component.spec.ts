import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedDepositsCashTransactionComponent } from './fixed-deposits-cash-transaction.component';

describe('FixedDepositsCashTransactionComponent', () => {
  let component: FixedDepositsCashTransactionComponent;
  let fixture: ComponentFixture<FixedDepositsCashTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FixedDepositsCashTransactionComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FixedDepositsCashTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
