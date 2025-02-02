import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewLoanProductComponent } from './view-loan-product.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('ViewLoanProductComponent', () => {
  let component: ViewLoanProductComponent;
  let fixture: ComponentFixture<ViewLoanProductComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewLoanProductComponent],
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
    fixture = TestBed.createComponent(ViewLoanProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
