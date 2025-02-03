import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveRecurringDepositsAccountComponent } from './approve-recurring-deposits-account.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';

describe('ApproveRecurringDepositsAccountComponent', () => {
  let component: ApproveRecurringDepositsAccountComponent;
  let fixture: ComponentFixture<ApproveRecurringDepositsAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ApproveRecurringDepositsAccountComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule
      ],
      providers: [DatePipe]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveRecurringDepositsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
