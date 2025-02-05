import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseRecurringDepositsAccountComponent } from './close-recurring-deposits-account.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { DatePipe } from '@angular/common';

describe('CloseRecurringDepositsAccountComponent', () => {
  let component: CloseRecurringDepositsAccountComponent;
  let fixture: ComponentFixture<CloseRecurringDepositsAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CloseRecurringDepositsAccountComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule
      ],
      providers: [DatePipe]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseRecurringDepositsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
