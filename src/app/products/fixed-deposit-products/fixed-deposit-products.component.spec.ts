import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedDepositProductsComponent } from './fixed-deposit-products.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('FixedDepositProductsComponent', () => {
  let component: FixedDepositProductsComponent;
  let fixture: ComponentFixture<FixedDepositProductsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FixedDepositProductsComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' })
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedDepositProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
