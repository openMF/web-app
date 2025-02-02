import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTaxComponentComponent } from './view-tax-component.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('ViewTaxComponentComponent', () => {
  let component: ViewTaxComponentComponent;
  let fixture: ComponentFixture<ViewTaxComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewTaxComponentComponent],
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
    fixture = TestBed.createComponent(ViewTaxComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
