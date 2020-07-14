import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivateCenterComponent } from './activate-center.component';

describe('ActivateCenterComponent', () => {
  let component: ActivateCenterComponent;
  let fixture: ComponentFixture<ActivateCenterComponent>;

  beforeEach(async(() => {
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
