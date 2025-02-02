import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRecurringDepositProductComponent } from './view-recurring-deposit-product.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('ViewRecurringDepositProductComponent', () => {
  let component: ViewRecurringDepositProductComponent;
  let fixture: ComponentFixture<ViewRecurringDepositProductComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewRecurringDepositProductComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' }) // Proporciona los parámetros necesarios para ActivatedRoute
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewRecurringDepositProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
