import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsMixComponent } from './products-mix.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';

describe('ProductsMixComponent', () => {
  let component: ProductsMixComponent;
  let fixture: ComponentFixture<ProductsMixComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProductsMixComponent],
      imports: [
        TranslateModule,
        RouterTestingModule
      ],
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
