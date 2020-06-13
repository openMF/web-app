import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrepayLoanComponent } from './prepay-loan.component';

describe('PrepayLoanComponent', () => {
  let component: PrepayLoanComponent;
  let fixture: ComponentFixture<PrepayLoanComponent>;

  beforeEach(async(() => {
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
