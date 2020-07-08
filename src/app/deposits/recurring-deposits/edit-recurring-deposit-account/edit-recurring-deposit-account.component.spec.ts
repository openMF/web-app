import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRecurringDepositAccountComponent } from './edit-recurring-deposit-account.component';

describe('EditRecurringDepositAccountComponent', () => {
  let component: EditRecurringDepositAccountComponent;
  let fixture: ComponentFixture<EditRecurringDepositAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditRecurringDepositAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditRecurringDepositAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
