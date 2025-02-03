import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCenterComponent } from './edit-center.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

describe('EditCenterComponent', () => {
  let component: EditCenterComponent;
  let fixture: ComponentFixture<EditCenterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditCenterComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
