import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ManageTaxComponentsComponent } from './manage-tax-components.component';

describe('FixedDepositProductsComponent', () => {
  let component: ManageTaxComponentsComponent;
  let fixture: ComponentFixture<ManageTaxComponentsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageTaxComponentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageTaxComponentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
