import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PeriodicAccrualsComponent } from './periodic-accruals.component';

describe('PeriodicAccrualsComponent', () => {
  let component: PeriodicAccrualsComponent;
  let fixture: ComponentFixture<PeriodicAccrualsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PeriodicAccrualsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeriodicAccrualsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
