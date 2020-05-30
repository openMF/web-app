import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AmountCollectedPieComponent } from './amount-collected-pie.component';

describe('AmountCollectedPieComponent', () => {
  let component: AmountCollectedPieComponent;
  let fixture: ComponentFixture<AmountCollectedPieComponent>;

  beforeEach(async(() => {
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
