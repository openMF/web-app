import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GroupActionsComponent } from './group-actions.component';

describe('GroupActionsComponent', () => {
  let component: GroupActionsComponent;
  let fixture: ComponentFixture<GroupActionsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupActionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
