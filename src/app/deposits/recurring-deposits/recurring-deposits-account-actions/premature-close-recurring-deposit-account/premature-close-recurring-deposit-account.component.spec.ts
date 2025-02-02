import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrematureCloseRecurringDepositAccountComponent } from './premature-close-recurring-deposit-account.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';

describe('PrematureCloseRecurringDepositAccountComponent', () => {
  let component: PrematureCloseRecurringDepositAccountComponent;
  let fixture: ComponentFixture<PrematureCloseRecurringDepositAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PrematureCloseRecurringDepositAccountComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule
      ],
      providers: [DatePipe]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrematureCloseRecurringDepositAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
