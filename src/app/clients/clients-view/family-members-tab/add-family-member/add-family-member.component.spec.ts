import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddFamilyMemberComponent } from './add-family-member.component';

describe('AddFamilyMemberComponent', () => {
  let component: AddFamilyMemberComponent;
  let fixture: ComponentFixture<AddFamilyMemberComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddFamilyMemberComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddFamilyMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
