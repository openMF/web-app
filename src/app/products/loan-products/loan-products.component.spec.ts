import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanProductsComponent } from './loan-products.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

describe('LoanProductsComponent', () => {
  let component: LoanProductsComponent;
  let fixture: ComponentFixture<LoanProductsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoanProductsComponent],
      imports: [RouterTestingModule],
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
    fixture = TestBed.createComponent(LoanProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
