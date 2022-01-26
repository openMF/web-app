import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditFloatingRateComponent } from './edit-floating-rate.component';

describe('EditFloatingRateComponent', () => {
  let component: EditFloatingRateComponent;
  let fixture: ComponentFixture<EditFloatingRateComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditFloatingRateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditFloatingRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
