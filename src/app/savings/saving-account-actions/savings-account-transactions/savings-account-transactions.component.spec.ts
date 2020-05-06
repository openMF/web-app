import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingsAccountTransactionsComponent } from './savings-account-transactions.component';

describe('TransactionsComponent', () => {
  let component: SavingsAccountTransactionsComponent;
  let fixture: ComponentFixture<SavingsAccountTransactionsComponent>;

  beforeEach(async(() => {
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
