import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DelinquencyRangeComponent } from './delinquency-range.component';

describe('DelinquencyRangeComponent', () => {
  let component: DelinquencyRangeComponent;
  let fixture: ComponentFixture<DelinquencyRangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DelinquencyRangeComponent ]
    })
    .compileComponents();
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
