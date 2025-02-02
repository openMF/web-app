import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFamilyMemberComponent } from './edit-family-member.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';

describe('EditFamilyMemberComponent', () => {
  let component: EditFamilyMemberComponent;
  let fixture: ComponentFixture<EditFamilyMemberComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditFamilyMemberComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule
      ],
      providers: [DatePipe]
    }).compileComponents();
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
