import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFloatingRateComponent } from './edit-floating-rate.component';

describe('EditFloatingRateComponent', () => {
  let component: EditFloatingRateComponent;
  let fixture: ComponentFixture<EditFloatingRateComponent>;

  beforeEach(async(() => {
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
