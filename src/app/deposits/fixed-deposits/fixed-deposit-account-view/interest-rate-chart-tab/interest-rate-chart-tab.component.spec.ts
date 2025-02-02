import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InterestRateChartTabComponent } from './interest-rate-chart-tab.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('InterestRateChartTabComponent', () => {
  let component: InterestRateChartTabComponent;
  let fixture: ComponentFixture<InterestRateChartTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [InterestRateChartTabComponent],
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
    fixture = TestBed.createComponent(InterestRateChartTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
