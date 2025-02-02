import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivateRecurringDepositsAccountComponent } from './activate-recurring-deposits-account.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

describe('ActivateRecurringDepositsAccountComponent', () => {
  let component: ActivateRecurringDepositsAccountComponent;
  let fixture: ComponentFixture<ActivateRecurringDepositsAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ActivateRecurringDepositsAccountComponent],
      imports: [
        ReactiveFormsModule,
        CommonModule,
        HttpClientModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivateRecurringDepositsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
