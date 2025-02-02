import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsMixComponent } from './products-mix.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('ProductsMixComponent', () => {
  let component: ProductsMixComponent;
  let fixture: ComponentFixture<ProductsMixComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProductsMixComponent],
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
    fixture = TestBed.createComponent(ProductsMixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
