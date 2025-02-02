import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RescheduleLoanComponent } from './reschedule-loan.component';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

describe('RescheduleLoanComponent', () => {
  let component: RescheduleLoanComponent;
  let fixture: ComponentFixture<RescheduleLoanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RescheduleLoanComponent],
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
    fixture = TestBed.createComponent(RescheduleLoanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
