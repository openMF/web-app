import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ViewChargeComponent } from './view-charge.component';

describe('ViewChargeComponent', () => {
  let component: ViewChargeComponent;
  let fixture: ComponentFixture<ViewChargeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewChargeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewChargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
