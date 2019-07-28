import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingProductChargesStepComponent } from './saving-product-charges-step.component';

describe('SavingProductChargesStepComponent', () => {
  let component: SavingProductChargesStepComponent;
  let fixture: ComponentFixture<SavingProductChargesStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SavingProductChargesStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavingProductChargesStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
