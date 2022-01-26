import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RejectLoanComponent } from './reject-loan.component';

describe('RejectLoanComponent', () => {
  let component: RejectLoanComponent;
  let fixture: ComponentFixture<RejectLoanComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RejectLoanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectLoanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
