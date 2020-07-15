import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewChargeComponent } from './view-charge.component';

describe('ViewChargeComponent', () => {
  let component: ViewChargeComponent;
  let fixture: ComponentFixture<ViewChargeComponent>;

  beforeEach(async(() => {
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
