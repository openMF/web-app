import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSavingProductComponent } from './create-saving-product.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule, DatePipe } from '@angular/common';

describe('CreateSavingProductComponent', () => {
  let component: CreateSavingProductComponent;
  let fixture: ComponentFixture<CreateSavingProductComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateSavingProductComponent],
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
    fixture = TestBed.createComponent(CreateSavingProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
