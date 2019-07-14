import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewLoanProductComponent } from './view-loan-product.component';

describe('ViewLoanProductComponent', () => {
  let component: ViewLoanProductComponent;
  let fixture: ComponentFixture<ViewLoanProductComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewLoanProductComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewLoanProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
