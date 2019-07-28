import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingProductDetailsStepComponent } from './saving-product-details-step.component';

describe('SavingProductDetailsStepComponent', () => {
  let component: SavingProductDetailsStepComponent;
  let fixture: ComponentFixture<SavingProductDetailsStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SavingProductDetailsStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavingProductDetailsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
