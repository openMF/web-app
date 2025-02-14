import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateLoanProductComponent } from './create-loan-product.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule, DatePipe } from '@angular/common';

describe('CreateLoanProductComponent', () => {
  let component: CreateLoanProductComponent;
  let fixture: ComponentFixture<CreateLoanProductComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateLoanProductComponent],
      imports: [
        HttpClientModule,
        RouterTestingModule,
        CommonModule
      ],
      providers: [
        DatePipe,
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
    fixture = TestBed.createComponent(CreateLoanProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
