import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditLoanProductComponent } from './edit-loan-product.component';

describe('EditLoanProductComponent', () => {
  let component: EditLoanProductComponent;
  let fixture: ComponentFixture<EditLoanProductComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditLoanProductComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditLoanProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
