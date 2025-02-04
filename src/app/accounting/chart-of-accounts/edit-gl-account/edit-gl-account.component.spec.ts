import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditGlAccountComponent } from './edit-gl-account.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('EditGlAccountComponent', () => {
  let component: EditGlAccountComponent;
  let fixture: ComponentFixture<EditGlAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditGlAccountComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        RouterTestingModule
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditGlAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
