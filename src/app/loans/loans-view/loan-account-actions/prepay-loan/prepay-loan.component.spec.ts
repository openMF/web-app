import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PrepayLoanComponent } from './prepay-loan.component';

describe('PrepayLoanComponent', () => {
  let component: PrepayLoanComponent;
  let fixture: ComponentFixture<PrepayLoanComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PrepayLoanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrepayLoanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
