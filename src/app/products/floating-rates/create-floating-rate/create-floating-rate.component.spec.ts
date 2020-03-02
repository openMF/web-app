import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateFloatingRateComponent } from './create-floating-rate.component';

describe('CreateFloatingRateComponent', () => {
  let component: CreateFloatingRateComponent;
  let fixture: ComponentFixture<CreateFloatingRateComponent>;

  beforeEach(async(() => {
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
