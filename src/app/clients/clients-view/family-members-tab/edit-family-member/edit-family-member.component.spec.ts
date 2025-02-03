import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFamilyMemberComponent } from './edit-family-member.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('EditFamilyMemberComponent', () => {
  let component: EditFamilyMemberComponent;
  let fixture: ComponentFixture<EditFamilyMemberComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditFamilyMemberComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientModule,
        TranslateModule,
        CommonModule
      ],
      providers: [
        DatePipe,
        TranslateService
      ]
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
