import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedDepositsCashTransactionComponent } from './fixed-deposits-cash-transaction.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { DatePipe } from '@angular/common';

describe('FixedDepositsCashTransactionComponent', () => {
  let component: FixedDepositsCashTransactionComponent;
  let fixture: ComponentFixture<FixedDepositsCashTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FixedDepositsCashTransactionComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule
      ],
      providers: [
        DatePipe
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FixedDepositsCashTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
