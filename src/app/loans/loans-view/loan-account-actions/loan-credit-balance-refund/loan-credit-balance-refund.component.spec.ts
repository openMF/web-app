import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanCreditBalanceRefundComponent } from './loan-credit-balance-refund.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('LoanCreditBalanceRefundComponent', () => {
  let component: LoanCreditBalanceRefundComponent;
  let fixture: ComponentFixture<LoanCreditBalanceRefundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoanCreditBalanceRefundComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule
      ],
      providers: [
        DatePipe,
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' })
          }
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanCreditBalanceRefundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
