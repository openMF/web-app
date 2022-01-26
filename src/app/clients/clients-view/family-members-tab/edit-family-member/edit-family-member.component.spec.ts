import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditFamilyMemberComponent } from './edit-family-member.component';

describe('EditFamilyMemberComponent', () => {
  let component: EditFamilyMemberComponent;
  let fixture: ComponentFixture<EditFamilyMemberComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditFamilyMemberComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditFamilyMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
