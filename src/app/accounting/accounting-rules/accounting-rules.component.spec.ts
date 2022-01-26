import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AccountingRulesComponent } from './accounting-rules.component';

describe('AccountingRulesComponent', () => {
  let component: AccountingRulesComponent;
  let fixture: ComponentFixture<AccountingRulesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountingRulesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountingRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
