import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareProductMarketPriceStepComponent } from './share-product-market-price-step.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('ShareProductMarketPriceStepComponent', () => {
  let component: ShareProductMarketPriceStepComponent;
  let fixture: ComponentFixture<ShareProductMarketPriceStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ShareProductMarketPriceStepComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareProductMarketPriceStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
