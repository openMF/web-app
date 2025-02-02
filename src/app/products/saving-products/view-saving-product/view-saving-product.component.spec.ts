import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSavingProductComponent } from './view-saving-product.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('ViewSavingProductComponent', () => {
  let component: ViewSavingProductComponent;
  let fixture: ComponentFixture<ViewSavingProductComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewSavingProductComponent],
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
    fixture = TestBed.createComponent(ViewSavingProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
