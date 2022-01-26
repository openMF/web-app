import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FamilyMembersTabComponent } from './family-members-tab.component';

describe('FamilyMembersTabComponent', () => {
  let component: FamilyMembersTabComponent;
  let fixture: ComponentFixture<FamilyMembersTabComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FamilyMembersTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FamilyMembersTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
