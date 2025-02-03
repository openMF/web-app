import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupsViewComponent } from './groups-view.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('GroupsViewComponent', () => {
  let component: GroupsViewComponent;
  let fixture: ComponentFixture<GroupsViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GroupsViewComponent],
      imports: [RouterTestingModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
