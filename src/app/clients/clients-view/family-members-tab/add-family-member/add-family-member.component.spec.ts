import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFamilyMemberComponent } from './add-family-member.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('AddFamilyMemberComponent', () => {
  let component: AddFamilyMemberComponent;
  let fixture: ComponentFixture<AddFamilyMemberComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddFamilyMemberComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();
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
