import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedDepositDatatableTabComponent } from './fixed-deposit-datatable-tab.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

describe('FixedDepositDatatableTabComponent', () => {
  let component: FixedDepositDatatableTabComponent;
  let fixture: ComponentFixture<FixedDepositDatatableTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FixedDepositDatatableTabComponent],
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
    fixture = TestBed.createComponent(FixedDepositDatatableTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
