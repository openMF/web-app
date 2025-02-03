import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFixedDepositProductComponent } from './edit-fixed-deposit-product.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';

describe('EditFixedDepositProductComponent', () => {
  let component: EditFixedDepositProductComponent;
  let fixture: ComponentFixture<EditFixedDepositProductComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditFixedDepositProductComponent],
      imports: [HttpClientModule],
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
    fixture = TestBed.createComponent(EditFixedDepositProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
