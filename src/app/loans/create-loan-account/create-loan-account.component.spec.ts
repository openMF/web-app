import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateLoanAccountComponent } from './create-loan-account.component';

describe('CreateLoanAccountComponent', () => {
  let component: CreateLoanAccountComponent;
  let fixture: ComponentFixture<CreateLoanAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateLoanAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateLoanAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
