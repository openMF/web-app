import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ActivateGroupComponent } from './activate-group.component';

describe('ActivateGroupComponent', () => {
  let component: ActivateGroupComponent;
  let fixture: ComponentFixture<ActivateGroupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivateGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivateGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
