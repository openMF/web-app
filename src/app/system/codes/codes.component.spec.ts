import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CodesComponent } from './codes.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { OverlayModule } from '@angular/cdk/overlay';

describe('CodesComponent', () => {
  let component: CodesComponent;
  let fixture: ComponentFixture<CodesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CodesComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        OverlayModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CodesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
