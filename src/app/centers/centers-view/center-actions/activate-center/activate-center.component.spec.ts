import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ActivateCenterComponent } from './activate-center.component';

describe('ActivateCenterComponent', () => {
  let component: ActivateCenterComponent;
  let fixture: ComponentFixture<ActivateCenterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivateCenterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivateCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
