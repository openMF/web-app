import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AmountCollectedPieComponent } from './amount-collected-pie.component';

describe('AmountCollectedPieComponent', () => {
  let component: AmountCollectedPieComponent;
  let fixture: ComponentFixture<AmountCollectedPieComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AmountCollectedPieComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AmountCollectedPieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
