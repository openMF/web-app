import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingProductDatatableTabComponent } from './saving-product-datatable-tab.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('SavingProductDatatableTabComponent', () => {
  let component: SavingProductDatatableTabComponent;
  let fixture: ComponentFixture<SavingProductDatatableTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SavingProductDatatableTabComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' }) // Proporciona los parámetros necesarios para ActivatedRoute
          }
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SavingProductDatatableTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
