import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SavingsAccountTransactionsComponent } from './savings-account-transactions.component';

describe('TransactionsComponent', () => {
  let component: SavingsAccountTransactionsComponent;
  let fixture: ComponentFixture<SavingsAccountTransactionsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SavingsAccountTransactionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavingsAccountTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
