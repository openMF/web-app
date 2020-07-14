import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseCenterComponent } from './close-center.component';

describe('CloseCenterComponent', () => {
  let component: CloseCenterComponent;
  let fixture: ComponentFixture<CloseCenterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CloseCenterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
