import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFloatingRateComponent } from './edit-floating-rate.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

describe('EditFloatingRateComponent', () => {
  let component: EditFloatingRateComponent;
  let fixture: ComponentFixture<EditFloatingRateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditFloatingRateComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditFloatingRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
