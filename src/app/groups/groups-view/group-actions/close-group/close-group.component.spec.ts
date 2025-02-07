import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseGroupComponent } from './close-group.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';

describe('CloseGroupComponent', () => {
  let component: CloseGroupComponent;
  let fixture: ComponentFixture<CloseGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CloseGroupComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientModule
      ],
      providers: [DatePipe]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
