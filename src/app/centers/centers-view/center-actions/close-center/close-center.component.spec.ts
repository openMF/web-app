import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseCenterComponent } from './close-center.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule, DatePipe } from '@angular/common';

describe('CloseCenterComponent', () => {
  let component: CloseCenterComponent;
  let fixture: ComponentFixture<CloseCenterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CloseCenterComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        RouterTestingModule,
        CommonModule
      ],
      providers: [DatePipe]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
