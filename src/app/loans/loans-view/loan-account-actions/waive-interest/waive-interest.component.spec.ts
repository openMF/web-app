import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WaiveInterestComponent } from './waive-interest.component';

describe('WaiveInterestComponent', () => {
  let component: WaiveInterestComponent;
  let fixture: ComponentFixture<WaiveInterestComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WaiveInterestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WaiveInterestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
