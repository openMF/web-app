import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareProductCurrencyStepComponent } from './share-product-currency-step.component';

describe('ShareProductCurrencyStepComponent', () => {
  let component: ShareProductCurrencyStepComponent;
  let fixture: ComponentFixture<ShareProductCurrencyStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareProductCurrencyStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareProductCurrencyStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
