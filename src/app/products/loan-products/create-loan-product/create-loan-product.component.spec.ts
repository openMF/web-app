import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateLoanProductComponent } from './create-loan-product.component';

describe('CreateLoanProductComponent', () => {
  let component: CreateLoanProductComponent;
  let fixture: ComponentFixture<CreateLoanProductComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateLoanProductComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateLoanProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
