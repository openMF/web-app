import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCenterComponent } from './create-center.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { DatePipe } from '@angular/common';

describe('CreateCenterComponent', () => {
  let component: CreateCenterComponent;
  let fixture: ComponentFixture<CreateCenterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateCenterComponent],
      imports: [
        HttpClientModule,
        ReactiveFormsModule,
        RouterTestingModule
      ],
      providers: [DatePipe]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
