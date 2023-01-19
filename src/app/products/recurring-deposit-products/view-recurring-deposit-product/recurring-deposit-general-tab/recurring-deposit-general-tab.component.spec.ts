import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurringDepositGeneralTabComponent } from './recurring-deposit-general-tab.component';

describe('RecurringDepositGeneralTabComponent', () => {
  let component: RecurringDepositGeneralTabComponent;
  let fixture: ComponentFixture<RecurringDepositGeneralTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecurringDepositGeneralTabComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurringDepositGeneralTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
