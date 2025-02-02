import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateFixedDepositProductComponent } from './create-fixed-deposit-product.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('CreateFixedDepositProductComponent', () => {
  let component: CreateFixedDepositProductComponent;
  let fixture: ComponentFixture<CreateFixedDepositProductComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateFixedDepositProductComponent],
      imports: [RouterTestingModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateFixedDepositProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
