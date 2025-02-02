import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedDepositDatatableTabComponent } from './fixed-deposit-datatable-tab.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('FixedDepositDatatableTabComponent', () => {
  let component: FixedDepositDatatableTabComponent;
  let fixture: ComponentFixture<FixedDepositDatatableTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FixedDepositDatatableTabComponent],
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
    fixture = TestBed.createComponent(FixedDepositDatatableTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
