import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditClosureComponent } from './edit-closure.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';

describe('EditClosureComponent', () => {
  let component: EditClosureComponent;
  let fixture: ComponentFixture<EditClosureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditClosureComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        RouterTestingModule,
        CommonModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditClosureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
