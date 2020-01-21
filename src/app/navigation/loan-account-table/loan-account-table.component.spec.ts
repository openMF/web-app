import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanAccountTableComponent } from './loan-account-table.component';

describe('LoanAccountTableComponent', () => {
  let component: LoanAccountTableComponent;
  let fixture: ComponentFixture<LoanAccountTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoanAccountTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanAccountTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
