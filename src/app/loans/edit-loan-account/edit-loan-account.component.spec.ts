import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLoanAccountComponent } from './edit-loan-account.component';

describe('EditLoanAccountComponent', () => {
  let component: EditLoanAccountComponent;
  let fixture: ComponentFixture<EditLoanAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditLoanAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditLoanAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
