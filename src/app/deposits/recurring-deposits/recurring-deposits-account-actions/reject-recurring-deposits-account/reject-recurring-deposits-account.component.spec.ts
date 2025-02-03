import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectRecurringDepositsAccountComponent } from './reject-recurring-deposits-account.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

describe('RejectRecurringDepositsAccountComponent', () => {
  let component: RejectRecurringDepositsAccountComponent;
  let fixture: ComponentFixture<RejectRecurringDepositsAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RejectRecurringDepositsAccountComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectRecurringDepositsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
