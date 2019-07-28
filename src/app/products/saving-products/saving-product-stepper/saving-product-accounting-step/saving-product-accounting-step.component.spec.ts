import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingProductAccountingStepComponent } from './saving-product-accounting-step.component';

describe('SavingProductAccountingStepComponent', () => {
  let component: SavingProductAccountingStepComponent;
  let fixture: ComponentFixture<SavingProductAccountingStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SavingProductAccountingStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavingProductAccountingStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
