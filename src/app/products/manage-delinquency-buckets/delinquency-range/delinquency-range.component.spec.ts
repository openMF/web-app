import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DelinquencyRangeComponent } from './delinquency-range.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('DelinquencyRangeComponent', () => {
  let component: DelinquencyRangeComponent;
  let fixture: ComponentFixture<DelinquencyRangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DelinquencyRangeComponent],
      imports: [RouterTestingModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DelinquencyRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
