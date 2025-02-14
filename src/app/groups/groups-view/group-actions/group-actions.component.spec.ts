import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupActionsComponent } from './group-actions.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('GroupActionsComponent', () => {
  let component: GroupActionsComponent;
  let fixture: ComponentFixture<GroupActionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GroupActionsComponent],
      imports: [RouterTestingModule]
    }).compileComponents();
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
