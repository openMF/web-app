import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurringDepositDatatableTabComponent } from './recurring-deposit-datatable-tab.component';

describe('RecurringDepositDatatableTabComponent', () => {
  let component: RecurringDepositDatatableTabComponent;
  let fixture: ComponentFixture<RecurringDepositDatatableTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecurringDepositDatatableTabComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurringDepositDatatableTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
