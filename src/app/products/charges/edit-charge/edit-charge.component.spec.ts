import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditChargeComponent } from './edit-charge.component';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

describe('EditChargeComponent', () => {
  let component: EditChargeComponent;
  let fixture: ComponentFixture<EditChargeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditChargeComponent],
      imports: [
        HttpClientModule,
        RouterTestingModule,
        ReactiveFormsModule
      ],
      providers: [DatePipe]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditChargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
