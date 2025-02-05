import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFamilyMemberComponent } from './add-family-member.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

describe('AddFamilyMemberComponent', () => {
  let component: AddFamilyMemberComponent;
  let fixture: ComponentFixture<AddFamilyMemberComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddFamilyMemberComponent],
      imports: [ReactiveFormsModule],
      providers: [DatePipe]
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
