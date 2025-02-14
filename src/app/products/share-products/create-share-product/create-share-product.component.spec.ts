import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateShareProductComponent } from './create-share-product.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';

describe('CreateShareProductComponent', () => {
  let component: CreateShareProductComponent;
  let fixture: ComponentFixture<CreateShareProductComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateShareProductComponent],
      imports: [
        HttpClientModule,
        RouterTestingModule
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
    fixture = TestBed.createComponent(CreateShareProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
