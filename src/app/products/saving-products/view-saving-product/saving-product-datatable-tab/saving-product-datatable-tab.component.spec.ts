import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingProductDatatableTabComponent } from './saving-product-datatable-tab.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

describe('SavingProductDatatableTabComponent', () => {
  let component: SavingProductDatatableTabComponent;
  let fixture: ComponentFixture<SavingProductDatatableTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SavingProductDatatableTabComponent],
      imports: [RouterTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' })
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
