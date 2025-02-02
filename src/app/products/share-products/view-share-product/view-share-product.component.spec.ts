import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewShareProductComponent } from './view-share-product.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('ViewShareProductComponent', () => {
  let component: ViewShareProductComponent;
  let fixture: ComponentFixture<ViewShareProductComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewShareProductComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ shareProductDatatables: 'Lorem lipsum in de lorem' }) // Proporciona los parámetros necesarios para ActivatedRoute
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewShareProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
