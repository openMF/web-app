import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewRecurringDepositComponent } from './new-recurring-deposit.component';

describe('NewRecurringDepositComponent', () => {
  let component: NewRecurringDepositComponent;
  let fixture: ComponentFixture<NewRecurringDepositComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewRecurringDepositComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewRecurringDepositComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
