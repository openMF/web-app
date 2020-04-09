import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewLoanAccountComponent } from './view-loan-account.component';

describe('ViewLoanAccountComponent', () => {
  let component: ViewLoanAccountComponent;
  let fixture: ComponentFixture<ViewLoanAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewLoanAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewLoanAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
