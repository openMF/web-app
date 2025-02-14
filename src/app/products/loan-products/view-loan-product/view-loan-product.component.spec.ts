import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewLoanProductComponent } from './view-loan-product.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

describe('ViewLoanProductComponent', () => {
  let component: ViewLoanProductComponent;
  let fixture: ComponentFixture<ViewLoanProductComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewLoanProductComponent],
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
    fixture = TestBed.createComponent(ViewLoanProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
