import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WriteOffPageComponent } from './write-off-page.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

describe('WriteOffPageComponent', () => {
  let component: WriteOffPageComponent;
  let fixture: ComponentFixture<WriteOffPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WriteOffPageComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientModule,
        CommonModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WriteOffPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
