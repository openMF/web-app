import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRecurringDepositAccountComponent } from './edit-recurring-deposit-account.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('EditRecurringDepositAccountComponent', () => {
  let component: EditRecurringDepositAccountComponent;
  let fixture: ComponentFixture<EditRecurringDepositAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditRecurringDepositAccountComponent],
      imports: [RouterTestingModule]
    }).compileComponents();
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
