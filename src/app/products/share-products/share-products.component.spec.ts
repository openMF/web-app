import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareProductsComponent } from './share-products.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('ShareProductsComponent', () => {
  let component: ShareProductsComponent;
  let fixture: ComponentFixture<ShareProductsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ShareProductsComponent],
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
    fixture = TestBed.createComponent(ShareProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
