import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurringDepositDatatableTabComponent } from './recurring-deposit-datatable-tab.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

describe('RecurringDepositDatatableTabComponent', () => {
  let component: RecurringDepositDatatableTabComponent;
  let fixture: ComponentFixture<RecurringDepositDatatableTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RecurringDepositDatatableTabComponent],
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
    fixture = TestBed.createComponent(RecurringDepositDatatableTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
