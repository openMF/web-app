import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreateFloatingRateComponent } from './create-floating-rate.component';

describe('CreateFloatingRateComponent', () => {
  let component: CreateFloatingRateComponent;
  let fixture: ComponentFixture<CreateFloatingRateComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateFloatingRateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateFloatingRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
