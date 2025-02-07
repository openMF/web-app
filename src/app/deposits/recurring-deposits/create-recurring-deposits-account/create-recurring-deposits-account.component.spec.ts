import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRecurringDepositsAccountComponent } from './create-recurring-deposits-account.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

describe('CreateRecurringDepositsAccountComponent', () => {
  let component: CreateRecurringDepositsAccountComponent;
  let fixture: ComponentFixture<CreateRecurringDepositsAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateRecurringDepositsAccountComponent],
      imports: [HttpClientModule],
      providers: [
        DatePipe,
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' })
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateRecurringDepositsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
